import * as models from "../models";
import { Assignment } from "./Assignment";
import { RootParentFinder } from "./RootParentFinder";

class UserSchedule {
  private userId;
  private userSchedule = [];

  public constructor(userId){
    this.userId = userId;
  }

  public asAnArrayOfAssignments() {
    return this.userSchedule;
  }

  public hasUserBeenAssignedToAnyWorkspaces() {
    return this.userSchedule.length > 0;
  }

  public assignWorkspace(workspaceId) {
    const assignment = new Assignment(this.userId, workspaceId);
    this.userSchedule.push(assignment);
  }

  public getMostRecentAssignment() {
    return this.userSchedule[this.userSchedule.length - 1];
  }

  public hasUserWorkedOnWorkspace(workspaceId) {
    for (const assignment of this.userSchedule) {
      if (assignment.getWorkspaceId() === workspaceId) {
        return true;
      }
    }

    return false;
  }
}

export { UserSchedule };
