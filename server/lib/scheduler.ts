import { filter } from "asyncro";
import * as models from "./models";

class Scheduler {
  private schedule = {};

  public async getCurrentWorkspace(user) {
    return this.schedule[user.user_id].slice(-1)[0];
  }

  public async findNextWorkspace(user) {
    if (!this.schedule[user.user_id]) {
      this.schedule[user.user_id] = [];
    }

    const userSchedule = this.schedule[user.user_id];

    const allWorkspaces = await models.Workspace.findAll();

    const filteredWorkspaces = await filter(
      allWorkspaces,
      async (w) => await this.isInTreeUserHasWorkedOnLeastRecently(userSchedule, allWorkspaces, w.id)
    );

    const finalWorkspaces = filteredWorkspaces.length > 0 ? filteredWorkspaces : allWorkspaces;

    this.schedule[user.user_id] = userSchedule.concat(finalWorkspaces[0].id);
  }

  private async getTreesUserHasWorkedOnLeastRecently(userSchedule, allWorkspaces) {
    const data = {}; // maps rootWorkspaceIds to array #

    // initialize at -1
    for (let i = 0; i < allWorkspaces.length; i++) {
      const workspace = allWorkspaces[i];
      const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace);
      data[rootParentWorkspace.id] = -1;
    }

    // go through user schedule and update
    for (let i = 0; i < userSchedule.length; i++) {
      const workspaceId = userSchedule[i];
      const workspace = await models.Workspace.findById(workspaceId);
      const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace);
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

  private async getRootParentOfWorkspace(workspace) {
    while (workspace.parentId) {
      workspace = await workspace.getParentWorkspace();
    }
    return workspace;
  }

  private async isInTreeUserHasWorkedOnLeastRecently(userSchedule, allWorkspaces, workspaceId) {
    const leastRecentlyWorkedOnTrees = await this.getTreesUserHasWorkedOnLeastRecently(userSchedule, allWorkspaces);
    const workspace = await models.Workspace.findById(workspaceId);
    const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace);

    return leastRecentlyWorkedOnTrees.find(id => id === rootParentWorkspace.id);
  }
}

const scheduler = new Scheduler();

export { scheduler };
