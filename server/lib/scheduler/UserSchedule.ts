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

  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  /*
  public async getTreesWorkedOnLeastRecently(workspaces) {
    const data = {}; // maps rootWorkspaceIds to array #

    // initialize at -1
    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];
      const rootParentWorkspace = await RootParentFinder.getRootParentOfWorkspace(workspace.id, workspace);
      data[rootParentWorkspace.id] = -1;
    }

    // go through user schedule and update
    for (let i = 0; i < this.userSchedule.length; i++) {
      const assignment = this.userSchedule[i];
      const workspaceId = assignment.getWorkspaceId();
      if (!workspaces.find(w => w.id === workspaceId)) {
        continue;
      }
      const workspace = await models.Workspace.findById(workspaceId);
      const rootParentWorkspace = await RootParentFinder.getRootParentOfWorkspace(workspace.id, workspace);
      data[rootParentWorkspace.id] = i;
    }

    // get smallest index
    let smallestIndex = Infinity;
    for (const workspaceId in data) {
      if (data.hasOwnProperty(workspaceId)) {
        smallestIndex = Math.min(smallestIndex, data[workspaceId]);
      }
    }

    // collect rootWorkspaceIds with this index
    const leastRecentlyWorkedOnTrees = [];
    for (const workspaceId in data) {
      if (data.hasOwnProperty(workspaceId)) {
        if (data[workspaceId] === smallestIndex)
        leastRecentlyWorkedOnTrees.push(workspaceId);
      }
    }

    return leastRecentlyWorkedOnTrees;
  }
  */


  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  /*
  public async isInTreeWorkedOnLeastRecently(workspaces, workspace) {
    const leastRecentlyWorkedOnTrees = await this.getTreesWorkedOnLeastRecently(workspaces);

    if (leastRecentlyWorkedOnTrees === undefined) {
      return true;
    }

    const rootParent = await RootParentFinder.getRootParentOfWorkspace(workspace.id, workspace);

    return leastRecentlyWorkedOnTrees.find(workspaceId => workspaceId === rootParent.id);
  }
  */

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
