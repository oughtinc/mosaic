import * as _ from "lodash";
import { Assignment } from "./Assignment";
import { RootParentFinder } from "./RootParentFinder";

class UserSchedule {
  private timeLimit;
  private userId;
  private userSchedule = [];

  public constructor({ timeLimit, userId }) {
    this.timeLimit = timeLimit;
    this.userId = userId;
  }

  public hasUserBeenAssignedToAnyWorkspaces() {
    return this.userSchedule.length > 0;
  }

  public assignWorkspace(workspaceId, startAtTimestamp = Date.now()) {
    const assignment = new Assignment({
      userId: this.userId,
      workspaceId,
      startAtTimestamp,
    });
    this.userSchedule.push(assignment);
  }

  public getMostRecentAssignment() {
    return this.userSchedule[this.userSchedule.length - 1];
  }

  public hasUserWorkedOnWorkspace(workspaceId) {
    return _.some(this.userSchedule, assignment => assignment.getWorkspaceId() === workspaceId);
  }

  public isUserCurrentlyWorkingOnWorkspace(workspaceId) {
    return (
      this.lastWorkedOnWorkspaceId() === workspaceId
      &&
      this.isActiveInLastWorkspace()
    );
  }

  private lastWorkedOnWorkspaceId() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    return lastWorkedOnAssignment.getWorkspaceId()
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

  public getTimestampWorkspaceLastWorkedOn(workspaceId) {
    let mostRecentTimestamp = -Infinity;

    for (const assignment of this.userSchedule) {
      if (assignment.getWorkspaceId() === workspaceId) {
        const curTimestamp = assignment.getStartedAtTimestamp();
        if (mostRecentTimestamp < curTimestamp) {
          mostRecentTimestamp = curTimestamp;
        }
      }
    }

    return mostRecentTimestamp;
  }
}

export { UserSchedule };
