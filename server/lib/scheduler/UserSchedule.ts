import * as _ from "lodash";
import { Assignment } from "./Assignment";

const ORACLE_TIME_LIMIT = 1000 * 60 * 15;
const TIME_LIMIT_EVEN_WITHOUT_TIME_BUDGET = 1000 * 60 * 20;

class UserSchedule {
  private distanceFromWorkedOnWorkspaceCache;
  private DistanceFromWorkedOnWorkspaceCache;
  private lastWorkedOnTimestampForTree = {};
  private rootParentCache;
  private timeLimit;
  private userId;
  private userSchedule: any = [];
  private hasUserLeftLastAssignment = false;
  private isLastAssignmentOracle = false;
  private isLastAssignmentTimed = true;

  public constructor({ DistanceFromWorkedOnWorkspaceCache, rootParentCache, timeLimit, userId }) {
    this.DistanceFromWorkedOnWorkspaceCache = DistanceFromWorkedOnWorkspaceCache;
    this.rootParentCache = rootParentCache;
    this.timeLimit = timeLimit;
    this.userId = userId;
  }

  public async assignWorkspace(workspace, startAtTimestamp = Date.now(), isOracle = false, isLastAssignmentTimed = true) {
    const assignment = new Assignment({
      userId: this.userId,
      workspace,
      startAtTimestamp,
    });

    this.userSchedule.push(assignment);

    this.hasUserLeftLastAssignment = false;
    this.isLastAssignmentOracle = isOracle;
    this.isLastAssignmentTimed = isLastAssignmentTimed;

    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);

    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
  }

  public leaveCurrentWorkspace() {
    this.hasUserLeftLastAssignment = true;
  }

  public getMostRecentAssignment() {
    return this.userSchedule[this.userSchedule.length - 1];
  }

  public getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces) {
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

  public hasUserWorkedOnWorkspace(workspace) {
    return _.some(this.userSchedule, assignment => assignment.getWorkspace().id === workspace.id);
  }

  public isUserCurrentlyWorkingOnWorkspace(workspace) {
    const lastWorkedOnWorkspace = this.lastWorkedOnWorkspace();

    if (!lastWorkedOnWorkspace) {
      return false;
    }

    return (
      this.lastWorkedOnWorkspace().id === workspace.id
      &&
      this.isActiveInLastWorkspace()
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
    if (this.hasUserLeftLastAssignment) {
      return false;
    }

    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();

    // handle case where time budgets aren't in use, but
    // we still don't want users taking over 15 minutes
    if (!this.isLastAssignmentTimed) {
      if (howLongAgoUserStartedWorkingOnIt < TIME_LIMIT_EVEN_WITHOUT_TIME_BUDGET) {
        return true;
      }
      return false;
    }

    // normal time budget case
    const timeLimit = this.isLastAssignmentOracle ? ORACLE_TIME_LIMIT : this.timeLimit;
    const didUserStartWorkingOnItWithinTimeLimit = howLongAgoUserStartedWorkingOnIt < timeLimit;

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
    if (shouldResetCache) {
      this.distanceFromWorkedOnWorkspaceCache = new this.DistanceFromWorkedOnWorkspaceCache({
        userSchedule: this,
        workspacesInTree,
      });
    }

    const workspacesWithDist = workspaces.map(w => ({
      distance: this.distanceFromWorkedOnWorkspaceCache.getDistFromWorkedOnWorkspace(w),
      workspace: w,
    }));

    const workspacesExceedingMinDistFromWorkedOnWorkspace = workspacesWithDist
      .filter(o => o.distance >= minDist)
      .map(o => o.workspace);
    
    return workspacesExceedingMinDistFromWorkedOnWorkspace
  }

  public getWorkspacesWithMostDistFromWorkedOnWorkspace({
    shouldResetCache = true,
    workspaces,
    workspacesInTree,
  }) {
    if (shouldResetCache) {
      this.distanceFromWorkedOnWorkspaceCache = new this.DistanceFromWorkedOnWorkspaceCache({
        userSchedule: this,
        workspacesInTree,
      });
    }

    const workspacesWithDist = workspaces.map(w => ({
      distance: this.distanceFromWorkedOnWorkspaceCache.getDistFromWorkedOnWorkspace(w),
      workspace: w,
    }));
    
    const maxDist = _.max(workspacesWithDist.map(o => o.distance));

    const maxWorkspacesWithDist = workspacesWithDist.filter(o => o.distance === maxDist);
    const maxWorkspaces = maxWorkspacesWithDist.map(o => o.workspace);

    return maxWorkspaces;
  }
}

export { UserSchedule };
