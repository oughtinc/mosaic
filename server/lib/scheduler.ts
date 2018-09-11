import { filter, map } from "asyncro";
import * as models from "./models";

class Scheduler {
  private schedule = {};

  public async getCurrentWorkspace(user) {
    const userSchedule = this.schedule[user.user_id];
    if (!userSchedule) return null;
    const lastAssignment = userSchedule.slice(-1)[0];
    return lastAssignment.workspaceId;
  }

  public async findNextWorkspace(user) {
    if (!this.schedule[user.user_id]) {
      this.schedule[user.user_id] = [];
    }

    const userSchedule = this.schedule[user.user_id];

    const allWorkspaces = await models.Workspace.findAll();

    const workspacesInTreeWorkedOnLeastRecently = await filter(
      allWorkspaces,
      async (w) => await this.isInTreeUserHasWorkedOnLeastRecently(userSchedule, allWorkspaces, w.id)
    );

    const notYetWorkedOnInThatTree = await filter(
      workspacesInTreeWorkedOnLeastRecently,
      async (w) => await this.hasNotBeenWorkedOnYet(w)
    );

    let finalWorkspaces = notYetWorkedOnInThatTree;

    if (finalWorkspaces.length === 0) {
      finalWorkspaces = await filter(
        workspacesInTreeWorkedOnLeastRecently,
        async (w) => await this.hasRemainingBudgetForChildren(w)
      );
    }

    if (finalWorkspaces.length === 0) {
      let workspaceWorkedOnLeastRecently;
      let whenThisWorkspaceWasWorkedOn;

      finalWorkspaces = await map(
        workspacesInTreeWorkedOnLeastRecently,
        async (w) => {
          const lastWorkedOnTimestamp = await this.getTimestampWorkspaceLastWorkedOn(w);
          if (!workspaceWorkedOnLeastRecently || lastWorkedOnTimestamp < whenThisWorkspaceWasWorkedOn) {
            workspaceWorkedOnLeastRecently = w;
            whenThisWorkspaceWasWorkedOn = lastWorkedOnTimestamp;
          }
        }
      );

      finalWorkspaces = [workspaceWorkedOnLeastRecently];
    }

    this.schedule[user.user_id] = userSchedule.concat({
      startedAt: Date.now(),
      workspaceId: finalWorkspaces[0].id,
    });
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
      const workspaceId = userSchedule[i].workspaceId;
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

  private async hasNotBeenWorkedOnYet(workspace) {
    for (const userId in this.schedule) {
      if (this.schedule.hasOwnProperty(userId)) {
        for (const assignment of this.schedule[userId]) {
          if (assignment.workspaceId === workspace.id) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private async hasRemainingBudgetForChildren(workspace) {
    return workspace.totalBudget > workspace.allocatedBudget;
  }

  private async getTimestampWorkspaceLastWorkedOn(workspace) {
    let lastWorkedOnTimestamp = -Infinity;

    for (const userId in this.schedule) {
      if (this.schedule.hasOwnProperty(userId)) {
        for (const assignment of this.schedule[userId]) {
          if (assignment.workspaceId === workspace.id) {
            if (assignment.startedAt > lastWorkedOnTimestamp) {
              lastWorkedOnTimestamp = assignment.startedAt;
            }
          }
        }
      }
    }

    return lastWorkedOnTimestamp;
  }
}

const scheduler = new Scheduler();

export { scheduler };
