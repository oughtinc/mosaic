import { filter, map } from "asyncro";
import * as models from "../models";

class Scheduler {
  private schedules = {};

  public async getCurrentWorkspace(userId) {
    const userSchedule = this.schedules[userId];
    if (!userSchedule) return null;
    const lastAssignment = userSchedule.slice(-1)[0];
    return lastAssignment.workspaceId;
  }

  public async findNextWorkspace(userId) {
    // reset cache so we don't use old eligibility info
    this.rootParentCache = {};

    if (!this.schedules[userId]) {
      this.schedules[userId] = [];
    }

    const userSchedule = this.schedules[userId];

    const allWorkspaces = await models.Workspace.findAll();

    let allEligibleWorkspaces = [];

    for (const w of allWorkspaces) {
      const isMarkedEligible = await this.isWorkspaceEligible(w);
      const isCurrentlyBeingWorkedOn = await this.isWorkspaceCurrentlyBeingWorkedOn(w);
      if (isMarkedEligible && !isCurrentlyBeingWorkedOn) {
        allEligibleWorkspaces.push(w);
      }
    }

    let workspacesInTreeWorkedOnLeastRecently = [];

    for (const w of allEligibleWorkspaces) {
      const shouldInclude = await this.isInTreeUserHasWorkedOnLeastRecently(userSchedule, allEligibleWorkspaces, w);
      if (shouldInclude) {
        workspacesInTreeWorkedOnLeastRecently.push(w);
      }
    }

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

    const randomIndex = Math.floor(Math.random() * (finalWorkspaces.length));

    this.schedules[userId] = userSchedule.concat({
      startedAt: Date.now(),
      workspaceId: finalWorkspaces[randomIndex].id,
    });
  }

  private async getTreesUserHasWorkedOnLeastRecently(userSchedule, workspaces) {
    const data = {}; // maps rootWorkspaceIds to array #

    // initialize at -1
    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];
      const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace.id, workspace);
      data[rootParentWorkspace.id] = -1;
    }

    // go through user schedule and update
    for (let i = 0; i < userSchedule.length; i++) {
      const workspaceId = userSchedule[i].workspaceId;
      if (!workspaces.find(w => w.id === workspaceId)) {
        continue;
      }
      const workspace = await models.Workspace.findById(workspaceId);
      const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace.id, workspace);
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

  private rootParentCache = {};

  private async getRootParentOfWorkspace(workspaceId, workspace) {
    if (this.rootParentCache[workspaceId]) {
      return this.rootParentCache[workspaceId];
    }

    if (!workspace) {
      workspace = await models.Workspace.findById(workspaceId);
    }

    if (!workspace.parentId) {
      this.rootParentCache[workspaceId] = workspace;
      return workspace;
    } else {
      const rootParent = await this.getRootParentOfWorkspace(workspace.parentId);
      this.rootParentCache[workspaceId] = rootParent;
      return rootParent;
    }
  }

  private async isWorkspaceCurrentlyBeingWorkedOn(w) {
    for (const userId in this.schedules) {
      if (this.schedules.hasOwnProperty(userId)) {
        const userSchedule = this.schedules[userId];
        if (userSchedule.length === 0) {
          continue;
        }

        const lastWorkedOn = userSchedule[userSchedule.length - 1];
        const didUserLastWorkOnWorkspace = lastWorkedOn.workspaceId === w.id;
        if (!didUserLastWorkOnWorkspace) {
          continue;
        }

        const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOn.startedAt;
        const FIVE_MINUTES = 5 * 60 * 1000;
        const FIFTEEN_SECOND_BUFFER = 15 * 1000;
        const didUserStartWorkingOnItFewerThan5MinutesAgo =
          howLongAgoUserStartedWorkingOnIt < (FIVE_MINUTES + FIFTEEN_SECOND_BUFFER);
        if (didUserStartWorkingOnItFewerThan5MinutesAgo) {
          return true;
        }
      }
    }
    return false;
  }

  private async isWorkspaceEligible(w) {
    // will add conditions to this later
    return true;
  }

  private async isInTreeUserHasWorkedOnLeastRecently(userSchedule, workspaces, workspace) {
    const leastRecentlyWorkedOnTrees = await this.getTreesUserHasWorkedOnLeastRecently(userSchedule, workspaces);
    const rootParentWorkspace = await this.getRootParentOfWorkspace(workspace.id, workspace);

    return leastRecentlyWorkedOnTrees.find(id => id === rootParentWorkspace.id);
  }

  private hasRemainingBudgetForChildren(workspace) {
    return workspace.totalBudget > workspace.allocatedBudget;
  }

  private async hasNotBeenWorkedOnYet(workspace) {
    for (const userId in this.schedules) {
      if (this.schedules.hasOwnProperty(userId)) {
        for (const assignment of this.schedules[userId]) {
          if (assignment.workspaceId === workspace.id) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private async getTimestampWorkspaceLastWorkedOn(workspace) {
    let lastWorkedOnTimestamp = -Infinity;

    for (const userId in this.schedules) {
      if (this.schedules.hasOwnProperty(userId)) {
        for (const assignment of this.schedules[userId]) {
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
