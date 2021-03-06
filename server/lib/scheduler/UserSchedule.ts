import * as _ from "lodash";
import { Assignment } from "./Assignment";

class UserSchedule {
  private createAssignment;
  private updateAssignment;
  private distanceFromWorkedOnWorkspaceCache;
  private DistanceFromWorkedOnWorkspaceCache;
  private lastWorkedOnTimestampForTree = {};
  private rootParentCache;
  private timeLimit;
  private userId;
  private userSchedule: any = [];

  public constructor({
    createAssignment,
    updateAssignment,
    DistanceFromWorkedOnWorkspaceCache,
    rootParentCache,
    timeLimit,
    userId,
  }) {
    this.createAssignment = createAssignment;
    this.updateAssignment = updateAssignment;
    this.DistanceFromWorkedOnWorkspaceCache = DistanceFromWorkedOnWorkspaceCache;
    this.rootParentCache = rootParentCache;
    this.timeLimit = timeLimit;
    this.userId = userId;
  }

  public getUserActivity() {
    const userActivity = this.userSchedule.map(assignment => ({
      howLongDidAssignmentLast: Math.min(
        3600 * 1000,
        assignment.getHowLongDidAssignmentLast(),
      ),
      startAtTimestamp: assignment.startAtTimestamp,
      workspace: assignment.getWorkspace(),
    }));
    return userActivity;
  }

  public async assignWorkspace(
    experimentId,
    workspace,
    startAtTimestamp = Date.now(),
    isOracle = false,
    isLastAssignmentTimed = true,
  ) {
    const assignment = new Assignment({
      createAssignment: this.createAssignment,
      updateAssignment: this.updateAssignment,
      experimentId,
      isOracle,
      isTimed: isLastAssignmentTimed,
      userId: this.userId,
      workspace,
      startAtTimestamp,
      endAtTimestamp: null,
    });

    this.userSchedule.push(assignment);

    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(
      workspace,
    );

    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
  }

  public async addAlreadySavedToDbAssignmentToSchedule({
    experimentId,
    workspace,
    startAtTimestamp,
    endAtTimestamp,
    isOracle,
    isLastAssignmentTimed,
  }) {
    const assignment = new Assignment({
      createAssignment: this.createAssignment,
      updateAssignment: this.updateAssignment,
      experimentId,
      isOracle,
      isTimed: isLastAssignmentTimed,
      userId: this.userId,
      workspace,
      startAtTimestamp,
      endAtTimestamp,
      isAlreadySavedToDb: true,
    });

    this.userSchedule.push(assignment);
  }

  public leaveCurrentWorkspace() {
    const curAssignment = this.getMostRecentAssignment();
    if (curAssignment) {
      curAssignment.endAssignment();
    }
  }

  public getMostRecentAssignment() {
    return this.userSchedule[this.userSchedule.length - 1];
  }

  public getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces) {
    const treesNotYetWorkedOn = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === undefined,
    );

    if (treesNotYetWorkedOn.length > 0) {
      return treesNotYetWorkedOn;
    }

    const lastWorkedOnTimestamps = rootWorkspaces.map(
      r => this.lastWorkedOnTimestampForTree[r.id],
    );

    const minTimestamp = Math.min.apply(Math, lastWorkedOnTimestamps);

    const leastRecentlyWorkedOnTrees = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === minTimestamp,
    );

    return leastRecentlyWorkedOnTrees;
  }

  public hasUserWorkedOnWorkspace(workspace) {
    return _.some(
      this.userSchedule,
      assignment => assignment.getWorkspace().id === workspace.id,
    );
  }

  public getAssignmentsForWorkspace(workspaceOrWorkspaceId) {
    let workspaceId;
    if (typeof workspaceOrWorkspaceId === "string") {
      workspaceId = workspaceOrWorkspaceId;
    } else {
      workspaceId = workspaceOrWorkspaceId.id;
    }

    return _.filter(
      this.userSchedule,
      assignment => assignment.getWorkspace().id === workspaceId,
    );
  }

  public isUserCurrentlyWorkingOnWorkspace(workspaceOrWorkspaceId) {
    let workspaceId;
    if (typeof workspaceOrWorkspaceId === "string") {
      workspaceId = workspaceOrWorkspaceId;
    } else {
      workspaceId = workspaceOrWorkspaceId.id;
    }
    const lastWorkedOnWorkspace = this.lastWorkedOnWorkspace();

    if (!lastWorkedOnWorkspace) {
      return false;
    }

    const isThisWorkspaceTheLastWorkedOnWorkspace =
      this.lastWorkedOnWorkspace().id === workspaceId;

    return (
      isThisWorkspaceTheLastWorkedOnWorkspace && this.isActiveInLastWorkspace()
    );
  }

  private lastWorkedOnWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();

    if (lastWorkedOnAssignment) {
      return lastWorkedOnAssignment.getWorkspace();
    }

    return undefined;
  }

  private isActiveInLastWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    if (!lastWorkedOnAssignment) {
      return false;
    }

    if (lastWorkedOnAssignment.hasEnded()) {
      return false;
    }

    const howLongAgoUserStartedWorkingOnIt =
      Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();

    // handle case where time budgets aren't in use, but
    // we still don't want users taking over 15 minutes
    if (!lastWorkedOnAssignment.isTimed) {
      return true;
    }

    // normal time budget case
    const didUserStartWorkingOnItWithinTimeLimit =
      howLongAgoUserStartedWorkingOnIt < this.timeLimit;
    if (didUserStartWorkingOnItWithinTimeLimit) {
      return true;
    }

    return false;
  }

  public getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
    minDist,
    shouldResetCache = true,
    workspaces,
    workspacesInTree,
  }) {
    if (shouldResetCache || !this.distanceFromWorkedOnWorkspaceCache) {
      this.distanceFromWorkedOnWorkspaceCache = new this.DistanceFromWorkedOnWorkspaceCache(
        {
          userSchedule: this,
          workspacesInTree,
        },
      );
    }

    const workspacesWithDist = workspaces.map(w => ({
      distance: this.distanceFromWorkedOnWorkspaceCache.getDistanceFromWorkedOnWorkspace(
        w,
      ),
      workspace: w,
    }));

    const workspacesExceedingMinDistFromWorkedOnWorkspace = workspacesWithDist
      .filter(o => o.distance >= minDist)
      .map(o => o.workspace);

    return workspacesExceedingMinDistFromWorkedOnWorkspace;
  }

  public getWorkspacesWithMostDistFromWorkedOnWorkspace({
    shouldResetCache = true,
    workspaces,
    workspacesInTree,
  }) {
    if (shouldResetCache || !this.distanceFromWorkedOnWorkspaceCache) {
      this.distanceFromWorkedOnWorkspaceCache = new this.DistanceFromWorkedOnWorkspaceCache(
        {
          userSchedule: this,
          workspacesInTree,
        },
      );
    }

    const workspacesWithDist = workspaces.map(w => ({
      distance: this.distanceFromWorkedOnWorkspaceCache.getDistanceFromWorkedOnWorkspace(
        w,
      ),
      workspace: w,
    }));

    const maxDist = _.max(workspacesWithDist.map(o => o.distance));

    const maxWorkspacesWithDist = workspacesWithDist.filter(
      o => o.distance === maxDist,
    );
    const maxWorkspaces = maxWorkspacesWithDist.map(o => o.workspace);

    return maxWorkspaces;
  }

  public getWorkspacesPreviouslyWorkedOnByUser({ workspaces }) {
    const workspacesPreviouslyWorkedOnByUser = workspaces.filter(w =>
      this.hasUserWorkedOnWorkspace(w),
    );
    return workspacesPreviouslyWorkedOnByUser;
  }
}

export { UserSchedule };
