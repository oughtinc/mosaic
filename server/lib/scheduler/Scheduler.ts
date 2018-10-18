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
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);
      const actionableWorkspaces = await this.getActionableWorkspacesForTree(userId, randomlySelectedTree);

      if (actionableWorkspaces.length > 0) {
        return actionableWorkspaces;
      } else {
        treesToConsider = _.difference(
          treesToConsider,
          [randomlySelectedTree]
        );
      }
    }
  }

  private async getActionableWorkspacesForTree(userId, rootWorkspace) {
    const workspacesInTree = await this.fetchAllWorkspacesInTree(rootWorkspace);
    console.log(
      "workspacesInTree",
      workspacesInTree.map(w => w.id)
    );

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(workspacesInTree);
    console.log(
      "workspacesNotCurrentlyBeingWorkedOn",
      workspacesNotCurrentlyBeingWorkedOn.map(w => w.id)
    );

    const workspacesWithAtLeastMinBudget = await this.filterByWhetherHasMinBudget(workspacesNotCurrentlyBeingWorkedOn);
    console.log(
      "workspacesWithAtLeastMinBudget",
      workspacesWithAtLeastMinBudget.map(w => w.id)
    );

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = await this.filterByStaleness(workspacesWithAtLeastMinBudget);
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

  private async getTreesWorkedOnLeastRecentlyByUser(userId, rootWorkspaces) {
    const treesWorkedOnLeastRecentlyByUser = this.schedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces, userId);
    return treesWorkedOnLeastRecentlyByUser;
  }

  private async filterByWhetherCurrentlyBeingWorkedOn(workspaces) {
    return workspaces.filter(w => !this.schedule.isWorkspaceCurrentlyBeingWorkedOn(w));
  }

  private filterByWhetherHasMinBudget(workspaces) {
    return workspaces.filter(w => this.hasMinRemaining(w));
  }

  private async filterByWhetherNotYetWorkedOn(workspaces) {
    return await filter(
      workspaces,
      async w => !await this.schedule.hasWorkspaceBeenWorkedOnYet(w)
    );
  }

  private hasMinRemaining(workspace) {
    return (workspace.totalBudget - workspace.allocatedBudget) >= 10;
  }
}

export { Scheduler };
