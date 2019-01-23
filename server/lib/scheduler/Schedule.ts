import { map } from "asyncro";
import * as _ from "lodash";
import { UserSchedule } from "./UserSchedule";

class Schedule {
  // the following object maps root workspace ids to timestamps
  // I didn't use a Map (and map a workspace object to a timestamp)
  // because Sequelize doesn't preserve object identity across queries
  private lastWorkedOnTimestampForTree = {};

  private DistanceFromWorkedOnWorkspaceCache;
  private rootParentCache;
  private schedule = new Map;
  private timeLimit;

  public constructor({ DistanceFromWorkedOnWorkspaceCache, rootParentCache, timeLimit }) {
    this.DistanceFromWorkedOnWorkspaceCache = DistanceFromWorkedOnWorkspaceCache;
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

    const userSchedule = new UserSchedule({
      DistanceFromWorkedOnWorkspaceCache: this.DistanceFromWorkedOnWorkspaceCache,
      rootParentCache: this.rootParentCache,
      timeLimit: this.timeLimit, userId
    });

    this.schedule.set(userId, userSchedule);
  }

  private getUserSchedule(userId) {
    return this.schedule.get(userId);
  }

  public async assignWorkspaceToUser({userId, workspace, startAtTimestamp = Date.now(), isOracle = false, isLastAssignmentTimed}) {
    this.createUserScheduleIfNotCreated(userId);
    const userSchedule = this.getUserSchedule(userId);
    await userSchedule.assignWorkspace(workspace, startAtTimestamp, isOracle, isLastAssignmentTimed);
    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
  }

  public leaveCurrentWorkspace(userId) {
    if (this.doesUserHaveASchedule(userId)) {
      const userSchedule = this.getUserSchedule(userId);
      userSchedule.leaveCurrentWorkspace();
    }
  }

  public reset() {
    this.schedule = new Map;
    this.lastWorkedOnTimestampForTree = {};
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

  public getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces, userId) {
    this.createUserScheduleIfNotCreated(userId);
    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces);
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

  public getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
    minDist,
    userId,
    shouldResetCache = true,
    workspaces,
    workspacesInTree,
  }) {
    this.createUserScheduleIfNotCreated(userId);
    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
      minDist,
      shouldResetCache,
      workspaces, 
      workspacesInTree,
    });
  }

  public getWorkspacesWithMostDistFromWorkedOnWorkspace({
    minDist,
    shouldResetCache = true,
    userId,
    workspaces,
    workspacesInTree,
  }) {
    this.createUserScheduleIfNotCreated(userId);
    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getWorkspacesWithMostDistFromWorkedOnWorkspace({
      minDist,
      shouldResetCache,
      workspaces, 
      workspacesInTree,
    });
  }
}

export { Schedule };
