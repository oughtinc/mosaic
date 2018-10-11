import { map } from "asyncro";
import * as _ from "lodash";
import { UserSchedule } from "./UserSchedule";

class Schedule {
  // the following object maps root workspace ids to timestamps
  // I didn't use a Map (and map a workspace object to a timestamp)
  // because Sequelize doesn't preserve object identity across queries
  private cacheForWhenTreeLastWorkedOn = {};

  private rootParentCache;
  private schedule = new Map;
  private timeLimit;

  public constructor({ rootParentCache, timeLimit }) {
    this.rootParentCache = rootParentCache;
    this.timeLimit = timeLimit;
  }

  private doesUserHaveASchedule(userId) {
    return this.schedule.has(userId);
  }

  private createUserSchedule(userId) {
    if (this.doesUserHaveASchedule(userId)) {
      return;
    }

    this.schedule.set(userId, new UserSchedule({ timeLimit: this.timeLimit, userId }));
  }

  private getUserSchedule(userId) {
    return this.schedule.get(userId);
  }

  public async assignWorkspaceToUser(userId, workspace, startAtTimestamp = Date.now()) {
    if (!this.doesUserHaveASchedule(userId)) {
      this.createUserSchedule(userId);
    }

    const userSchedule = this.getUserSchedule(userId);
    userSchedule.assignWorkspace(workspace, startAtTimestamp);
    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    this.cacheForWhenTreeLastWorkedOn[rootParent.id] = startAtTimestamp;
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
  public async isInTreeWorkedOnLeastRecently(workspaces, workspace) {
    const treesWorksOnLeastRecently = await this.getTreesWorkedOnLeastRecently(workspaces);
    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    return !!(treesWorksOnLeastRecently.find(rootWorkspace => rootWorkspace === rootParent));
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    argument belong to
  */
  public async getTreesWorkedOnLeastRecently(workspaces) {
    const rootParents = await map(
      workspaces,
      async workspace => await this.rootParentCache.getRootParentOfWorkspace(workspace),
    );

    const uniqRootParents = _.uniqBy(rootParents, w => w.id);

    const treesNotYetWorkedOn = uniqRootParents.filter(
      rootParent => this.cacheForWhenTreeLastWorkedOn[rootParent.id] === undefined
    );

    if (treesNotYetWorkedOn.length > 0) {
      return treesNotYetWorkedOn;
    }

    const lastWorkedOnTimestamps = uniqRootParents.map(
      rootParent => this.cacheForWhenTreeLastWorkedOn[rootParent.id]
    );

    const minTimestamp = Math.min.apply(Math, lastWorkedOnTimestamps);

    const leastRecentlyWorkedOnTrees = uniqRootParents.filter(rootParent =>
      this.cacheForWhenTreeLastWorkedOn[rootParent.id] === minTimestamp
    );

    return leastRecentlyWorkedOnTrees;
  }

  public isWorkspaceCurrentlyBeingWorkedOn(workspace) {
    for (const [userId, userSchedule] of this.schedule) {
      if (userSchedule.isUserCurrentlyWorkingOnWorkspace(workspace)) {
        return true;
      }
    }

    return false;
  }

  public hasWorkspaceBeenWorkedOnYet(workspace) {
    for (const [userId, userSchedule] of this.schedule) {
      if (userSchedule.hasUserWorkedOnWorkspace(workspace)) {
        return true;
      }
    }

    return false;
  }

  public getTimestampWorkspaceLastWorkedOn(workspace) {
    let mostRecentTimestamp = -Infinity;

    for (const [userId, userSchedule] of this.schedule) {
      const curTimestamp = userSchedule.getTimestampWorkspaceLastWorkedOn(workspace);
      if (mostRecentTimestamp < curTimestamp) {
        mostRecentTimestamp = curTimestamp;
      }
    }

    return mostRecentTimestamp;
  }

  public getLeastRecentlyActiveWorkspace(workspaces) {
    let workspaceWorkedOnLeastRecently;
    let whenThisWorkspaceWasWorkedOn;

    workspaces.forEach(workspace => {
      const lastWorkedOnTimestamp = this.getTimestampWorkspaceLastWorkedOn(workspace);
      if (!workspaceWorkedOnLeastRecently || lastWorkedOnTimestamp < whenThisWorkspaceWasWorkedOn) {
        workspaceWorkedOnLeastRecently = workspace;
        whenThisWorkspaceWasWorkedOn = lastWorkedOnTimestamp;
      }
    });

    return workspaceWorkedOnLeastRecently;
  }

}

export { Schedule };
