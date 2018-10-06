import { map } from "asyncro";
import * as _ from "lodash";
import { UserSchedule } from "./UserSchedule";

class Schedule {
  private cacheForWhenTreeLastWorkedOn = {};
  private rootParentFinder;
  private schedule = new Map;
  private timeLimit;

  public constructor({ rootParentFinder, timeLimit }) {
    this.rootParentFinder = rootParentFinder;
    this.timeLimit = timeLimit;
  }

  private doesUserHaveASchedule(userId) {
    return this.schedule.has(userId);
  }

  private createUserSchedule(userId) {
    this.schedule.set(userId, new UserSchedule({ timeLimit: this.timeLimit, userId }));
  }

  private getUserSchedule(userId) {
    return this.schedule.get(userId);
  }

  public assignWorkspaceToUser(userId, workspaceId) {
    if (!this.doesUserHaveASchedule(userId)) {
      this.createUserSchedule(userId);
    }

    const userSchedule = this.getUserSchedule(userId);
    const startAtTimestamp = Date.now();
    userSchedule.assignWorkspace(workspaceId, startAtTimestamp);

    const rootParentId = this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId);
    this.cacheForWhenTreeLastWorkedOn[rootParentId] = startAtTimestamp;
  }

  public getMostRecentAssignmentForUser(userId) {
    if (!this.doesUserHaveASchedule(userId)) {
      return undefined;
    }

    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getMostRecentAssignment();
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    argument belong to
  */
  public async isInTreeWorkedOnLeastRecently(workspaceIds, workspaceId) {
    const treesWorksOnLeastRecently = await this.getTreesWorkedOnLeastRecently(workspaceIds);
    const rootParentId = await this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId);
    return Boolean(treesWorksOnLeastRecently.find(rootWorkspaceId => rootWorkspaceId === rootParentId));
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    argument belong to
  */
  public async getTreesWorkedOnLeastRecently(workspaceIds) {
    const rootParentIds = await map(
      workspaceIds,
      async workspaceId => await this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId),
    );

    const uniqRootParentIds = _.uniq(rootParentIds);

    const treesNotYetWorkedOn = uniqRootParentIds.filter(
      id => this.cacheForWhenTreeLastWorkedOn[id] === undefined
    );

    if (treesNotYetWorkedOn.length > 0) {
      return treesNotYetWorkedOn;
    }

    const lastWorkedOnTimestamps = uniqRootParentIds.map(
      id => this.cacheForWhenTreeLastWorkedOn[id]
    );

    const minTimestamp = Math.min.apply(Math, lastWorkedOnTimestamps);

    const leastRecentlyWorkedOnTrees = uniqRootParentIds.filter(id =>
      this.cacheForWhenTreeLastWorkedOn[id] === minTimestamp
    );

    return leastRecentlyWorkedOnTrees;
  }

  public isWorkspaceCurrentlyBeingWorkedOn(workspaceId) {
    for (const [userId, userSchedule] of this.schedule) {
      if (userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaceId)) {
        return true;
      }
    }

    return false;
  }

  public hasWorkspaceBeenWorkedOnYet(workspaceId) {
    for (const [userId, userSchedule] of this.schedule) {
      if (userSchedule.hasUserWorkedOnWorkspace(workspaceId)) {
        return true;
      }
    }

    return false;
  }

  public getTimestampWorkspaceLastWorkedOn(workspaceId) {
    let lastWorkedOnTimestamp = -Infinity;

    for (const [userId, userSchedule] of this.schedule) {
      for (const assignment of userSchedule.userSchedule) {
        if (assignment.workspaceId === workspaceId) {
          const startedAtTimestamp = assignment.getStartedAtTimestamp();
          if (startedAtTimestamp > lastWorkedOnTimestamp) {
            lastWorkedOnTimestamp = startedAtTimestamp;
          }
        }
      }
    }

    return lastWorkedOnTimestamp;
  }

  public getWhichOfTheseWorkspacesWorkedOnLeastRecently(workspaceIds) {
    let idOfWorkspaceWorkedOnLeastRecently;
    let whenThisWorkspaceWasWorkedOn;

    workspaceIds.forEach(workspaceId => {
      const lastWorkedOnTimestamp = this.getTimestampWorkspaceLastWorkedOn(workspaceId);
      if (!idOfWorkspaceWorkedOnLeastRecently || lastWorkedOnTimestamp < whenThisWorkspaceWasWorkedOn) {
        idOfWorkspaceWorkedOnLeastRecently = workspaceId;
        whenThisWorkspaceWasWorkedOn = lastWorkedOnTimestamp;
      }
    });

    return idOfWorkspaceWorkedOnLeastRecently;
  }

}

export { Schedule };
