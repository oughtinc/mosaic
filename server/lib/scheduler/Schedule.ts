import { map } from "asyncro";
import * as _ from "lodash";
import { UserSchedule } from "./UserSchedule";

class Schedule {
  // the following object maps root workspace ids to timestamps
  // I didn't use a Map (and map a workspace object to a timestamp)
  // because Sequelize doesn't preserve object identity across queries
  private lastWorkedOnTimestampForTree = {};

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

  private createUserScheduleIfNotCreated(userId) {
    if (this.doesUserHaveASchedule(userId)) {
      return;
    }

    this.schedule.set(userId, new UserSchedule({ timeLimit: this.timeLimit, userId }));
  }

  private getUserSchedule(userId) {
    return this.schedule.get(userId);
  }

  public async assignWorkspaceToUser(userId, workspace, startAtTimestamp = Date.now()) {
    this.createUserScheduleIfNotCreated(userId);
    const userSchedule = this.getUserSchedule(userId);
    userSchedule.assignWorkspace(workspace, startAtTimestamp);
    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
  }

  public getMostRecentAssignmentForUser(userId) {
    if (!this.doesUserHaveASchedule(userId)) {
      return undefined;
    }

    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getMostRecentAssignment();
  }

  /*
    NOTE: this only considers the trees associated with the rootWorkspaces
    argument
  */
  public async isInTreeWorkedOnLeastRecently(rootWorkspaces, workspace) {
    const treesWorkedOnLeastRecently = this.getTreesWorkedOnLeastRecently(rootWorkspaces);
    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    return !!(treesWorkedOnLeastRecently.find(rootWorkspace => rootWorkspace.id === rootParent.id));
  }

  /*
    NOTE: this only considers the trees associated with the rootWorkspaces
    argument
  */
  public getTreesWorkedOnLeastRecently(rootWorkspaces) {
    const treesNotYetWorkedOn = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === undefined
    );

    if (treesNotYetWorkedOn.length > 0) {
      return treesNotYetWorkedOn;
    }

    const lastWorkedOnTimestamps = rootWorkspaces.map(
      r => this.lastWorkedOnTimestampForTree[r.id]
    );

    const minTimestamp = Math.min.apply(Math, lastWorkedOnTimestamps);

    const leastRecentlyWorkedOnTrees = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === minTimestamp
    );

    return leastRecentlyWorkedOnTrees;
  }

  public isWorkspaceCurrentlyBeingWorkedOn(workspace) {
    return _.some(
      [...this.schedule],
      ([userId, userSchedule]) => userSchedule.isUserCurrentlyWorkingOnWorkspace(workspace)
    );
  }

  public hasWorkspaceBeenWorkedOnYet(workspace) {
    return _.some(
      [...this.schedule],
      ([userId, userSchedule]) => userSchedule.hasUserWorkedOnWorkspace(workspace)
    );
  }

  public getTimestampWorkspaceLastWorkedOn(workspace) {
    const timestampsWorkspaceLastWorkedOn =
      [...this.schedule].map(
        ([userId, userSchedule]) => userSchedule.getTimestampWorkspaceLastWorkedOn(workspace)
      );

    return _.max(timestampsWorkspaceLastWorkedOn);
  }

  public getLeastRecentlyActiveWorkspace(workspaces) {
    return _.minBy(workspaces, w => this.getTimestampWorkspaceLastWorkedOn(w));
  }

}

export { Schedule };
