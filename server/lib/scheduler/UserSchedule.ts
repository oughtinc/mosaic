import * as _ from "lodash";
import { Assignment } from "./Assignment";
import { RootParentFinder } from "./RootParentFinder";

const ORACLE_TIME_LIMIT = 1000 * 60 * 15;

class UserSchedule {
  private lastWorkedOnTimestampForTree = {};
  private rootParentCache;
  private timeLimit;
  private userId;
  private userSchedule = [];
  private hasUserLeftLastAssignment = false;
  private isLastAssignmentOracle = false;
  private isLastAssignmentTimed = true;

  public constructor({ rootParentCache, timeLimit, userId }) {
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

    if (!this.hasUserLeftLastAssignment && !this.isLastAssignmentTimed) {
      return true;
    }

    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();


    const timeLimit = this.isLastAssignmentOracle ? ORACLE_TIME_LIMIT : this.timeLimit;
    const didUserStartWorkingOnItWithinTimeLimit = howLongAgoUserStartedWorkingOnIt < timeLimit;

    if (didUserStartWorkingOnItWithinTimeLimit) {
      return true;
    }

    return false;
  }
}

export { UserSchedule };
