import { filter, map } from "asyncro";
import * as _ from "lodash";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private fetchAllWorkspacesInTree;
  private fetchAllRootWorkspaces;
  private remainingBudgetAmongDescendantsCache;
  private rootParentCache;
  private schedule;

  public constructor({
    fetchAllWorkspacesInTree,
    fetchAllRootWorkspaces,
    remainingBudgetAmongDescendantsCache,
    rootParentCache,
    schedule,
  }) {
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.remainingBudgetAmongDescendantsCache = remainingBudgetAmongDescendantsCache;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
  }

  public async getIdOfCurrentWorkspace(userId) {
    const assignment = this.schedule.getMostRecentAssignmentForUser(userId);
    return assignment.getWorkspace().id;
  }

  public async assignNextWorkspace(userId) {
    // clear caches so we don't rely on old information
    this.rootParentCache.clearRootParentCache();
    this.remainingBudgetAmongDescendantsCache.clearRemainingBudgetAmongDescendantsCache();

    const actionableWorkspaces = await this.getActionableWorkspaces(userId);
    console.log("actionableWorkspaces", actionableWorkspaces.map(w => w.id));

    const assignedWorkspace = pickRandomItemFromArray(actionableWorkspaces);
    console.log("assignedWorkspace", assignedWorkspace.id);

    if (!assignedWorkspace) {
      throw new Error("No workspace to choose from");
    }

    await this.schedule.assignWorkspaceToUser(userId, assignedWorkspace);
  }

  private async getActionableWorkspaces(userId) {
    let treesToConsider = await this.fetchAllRootWorkspaces();

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const actionableWorkspaces = await this.getActionableWorkspacesForTheseTrees(userId, leastRecentlyWorkedOnTreesToConsider);

      if (actionableWorkspaces.length > 0) {
        return actionableWorkspaces;
      } else {
        treesToConsider = _.difference(
          treesToConsider,
          leastRecentlyWorkedOnTreesToConsider
        );
      }
    }
  }

  private async getActionableWorkspacesForTheseTrees(userId, rootWorkspaces) {
    const workspacesInTheseTrees = await this.getWorkspacesInTheseTrees(rootWorkspaces);
    console.log(
      "workspacesInTheseTrees",
      workspacesInTheseTrees.map(w => w.id)
    );

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(workspacesInTheseTrees);
    console.log(
      "workspacesNotCurrentlyBeingWorkedOn",
      workspacesNotCurrentlyBeingWorkedOn.map(w => w.id)
    );

    const workspacesWithRemainingBudget = await this.filterByWhetherHasRemainingBudget(workspacesNotCurrentlyBeingWorkedOn);
    console.log(
      "workspacesWithRemainingBudget",
      workspacesWithRemainingBudget.map(w => w.id)
    );

    let eligibleWorkspaces = workspacesWithRemainingBudget;

    const staleWorkspaces = await this.filterByStaleness(workspacesWithRemainingBudget);
    console.log(
      "staleWorkspaces",
      staleWorkspaces.map(w => w.id)
    );

    // filter by staleness IF there are some stale ones
    if (staleWorkspaces.length > 0) {
      eligibleWorkspaces = staleWorkspaces;
    }
    console.log("eligibleWorkspaces", eligibleWorkspaces.map(w => w.id))

    const workspaceWithLeastRemainingBudgetAmongDescendants = await this.getWorkspacesWithLeastRemainingBugetAmongDescendants(eligibleWorkspaces);
    console.log("least remaining descend budget", workspaceWithLeastRemainingBudgetAmongDescendants.map(w => w.id))

    const finalWorkspaces = workspaceWithLeastRemainingBudgetAmongDescendants;

    return finalWorkspaces;
  }

  private async filterByStaleness(workspaces) {
    return await filter(
      workspaces,
      async w => await w.isStale
    );
  }

  private async getWorkspacesWithLeastRemainingBugetAmongDescendants(workspaces) {
    const workspacesWithRemainingDescendantBudget = await map(
      workspaces,
      async w => {
        const remainingBudgetAmongDescendants = await this.remainingBudgetAmongDescendantsCache.getRemainingBudgetAmongDescendants(w);

        return {
            remainingBudgetAmongDescendants,
            workspace: w,
        };
      }
    );

    const minLeastRemainingBudgetAmongDescendants = _.min(
      workspacesWithRemainingDescendantBudget.map(o => o.remainingBudgetAmongDescendants)
    );

    const workspacesToReturn = workspacesWithRemainingDescendantBudget
      .filter(o => o.remainingBudgetAmongDescendants === minLeastRemainingBudgetAmongDescendants)
      .map(o => o.workspace);

    return workspacesToReturn;
  }

  private async getTreesWorkedOnLeastRecently() {
    const rootWorkspaces = await this.fetchAllRootWorkspaces();
    return this.schedule.getTreesWorkedOnLeastRecently(rootWorkspaces);
  }

  private async getTreesWorkedOnLeastRecentlyByUser(userId, rootWorkspaces) {
    const treesWorkedOnLeastRecentlyByUser = this.schedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces, userId);
    return treesWorkedOnLeastRecentlyByUser;
  }

  private async getWorkspacesInTreesWorkedOnLeastRecently() {
    const treesWorkedOnLeastRecently = await this.getTreesWorkedOnLeastRecently();

    let workspacesInTreesWorkedOnLeastRecently = [];
    for (const tree of treesWorkedOnLeastRecently) {
      const children = await this.fetchAllWorkspacesInTree(tree);
      if (children.length > 0) {
        workspacesInTreesWorkedOnLeastRecently.push(...children);
      }
    }

    return workspacesInTreesWorkedOnLeastRecently;
  }

  private async getWorkspacesInTheseTrees(rootWorkspaces) {
    let workspacesInTheseTrees = [];
    for (const tree of rootWorkspaces) {
      const children = await this.fetchAllWorkspacesInTree(tree);
      if (children.length > 0) {
        workspacesInTheseTrees.push(...children);
      }
    }

    return workspacesInTheseTrees;
  }

  private async getWorkspacesInTreesWorkedOnLeastRecentlyByUser(userId) {
    const treesWorkedOnLeastRecently = await this.getTreesWorkedOnLeastRecentlyByUser(userId);
    console.log("treesWorkedOnLeastRecently 2", treesWorkedOnLeastRecently.map(w => w.id));
    let workspacesInTreesWorkedOnLeastRecently = [];
    for (const tree of treesWorkedOnLeastRecently) {
      const children = await this.fetchAllWorkspacesInTree(tree);
      if (children.length > 0) {
        workspacesInTreesWorkedOnLeastRecently.push(...children);
      }
    }

    return workspacesInTreesWorkedOnLeastRecently;
  }

  private async filterByWhetherCurrentlyBeingWorkedOn(workspaces) {
    return workspaces.filter(w => !this.schedule.isWorkspaceCurrentlyBeingWorkedOn(w));
  }

  private filterByWhetherHasRemainingBudget(workspaces) {
    return workspaces.filter(w => this.hasRemainingBudgetForChildren(w));
  }

  private async filterByWhetherNotYetWorkedOn(workspaces) {
    return await filter(
      workspaces,
      async w => !await this.schedule.hasWorkspaceBeenWorkedOnYet(w)
    );
  }

  private filterByWhetherHasRemainingBudget(workspaces) {
    return workspaces.filter(this.hasRemainingBudgetForChildren);
  }

  private isWorkspaceEligible(w) {
    // will add conditions to this later
    return true;
  }

  private hasRemainingBudgetForChildren(workspace) {
    return workspace.totalBudget > workspace.allocatedBudget;
  }
}

export { Scheduler };
