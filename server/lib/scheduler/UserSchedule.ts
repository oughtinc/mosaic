import * as _ from "lodash";
import { Assignment } from "./Assignment";
import { RootParentFinder } from "./RootParentFinder";

class UserSchedule {
  private lastWorkedOnTimestampForTree = {};
  private rootParentCache;
  private timeLimit;
  private userId;
  private userSchedule = [];

  public constructor({ rootParentCache, timeLimit, userId }) {
    this.rootParentCache = rootParentCache;
    this.timeLimit = timeLimit;
    this.userId = userId;
  }

  public async assignWorkspace(workspace, startAtTimestamp = Date.now()) {
    const assignment = new Assignment({
      userId: this.userId,
      workspace,
      startAtTimestamp,
    });

    this.userSchedule.push(assignment);

    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);

    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
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
    const getLastWorkedOnWorkspace = this.getLastWorkedOnWorkspace();

    if (!getLastWorkedOnWorkspace) {
      return false;
    }

    return (
      getLastWorkedOnWorkspace.id === workspace.id
      &&
      this.isActiveInLastWorkspace()
    );
  }

  private getLastWorkedOnWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();

    if (lastWorkedOnAssignment) {
      return lastWorkedOnAssignment.getWorkspace();
    }

    return undefined;
  }

  private isActiveInLastWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();
    const didUserStartWorkingOnItWithinTimeLimit = howLongAgoUserStartedWorkingOnIt < this.timeLimit;

    if (didUserStartWorkingOnItWithinTimeLimit) {
      return true;
    }

    return false;
  }
}

export { UserSchedule };
