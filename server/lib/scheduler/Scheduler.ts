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
    isInOracleMode,
    remainingBudgetAmongDescendantsCache,
    rootParentCache,
    schedule,
    timeLimit,
  }) {
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.remainingBudgetAmongDescendantsCache = remainingBudgetAmongDescendantsCache;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
    this.timeLimit = timeLimit;
  }

  public async getIdOfCurrentWorkspace(userId) {
    const assignment = this.schedule.getMostRecentAssignmentForUser(userId);

    if (!assignment) {
      return undefined;
    }

    const workspace = assignment.getWorkspace();

    return workspace.id;
  }

  public async assignNextWorkspaceForOracle(userId) {
    // clear caches so we don't rely on old information
    this.rootParentCache.clearRootParentCache();
    this.remainingBudgetAmongDescendantsCache.clearRemainingBudgetAmongDescendantsCache();

    let treesToConsider = await this.fetchAllRootWorkspaces();
    let wasWorkspaceAssigned = false;

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);

      const workspacesInTree = await this.fetchAllWorkspacesInTree(randomlySelectedTree);

      const oracleEligibleWorkspaces = workspacesInTree
        .filter(w => w.isEligibleForOracle);

      const workspacesToConsider = await this.filterByWhetherCurrentlyBeingWorkedOn(oracleEligibleWorkspaces);

      // we want to prioritize older workspaces
      workspacesToConsider.sort((w1, w2) => w1 - w2);

      const assignedWorkspace = workspacesToConsider[0];

      if (!assignedWorkspace) {
        treesToConsider = _.difference(
          treesToConsider,
          [randomlySelectedTree]
        );
      } else {
        await this.schedule.assignWorkspaceToUser({
          userId,
          workspace: assignedWorkspace,
          isOracle: true,
        });
        wasWorkspaceAssigned = true;
        break;
      }
    }

    if (!wasWorkspaceAssigned) {
      this.schedule.leaveCurrentWorkspace(userId);
      throw new Error("No eligible workspace for oracle");
    }
  }

  public async assignNextWorkspace(userId) {
    // clear caches so we don't rely on old information
    this.rootParentCache.clearRootParentCache();
    this.remainingBudgetAmongDescendantsCache.clearRemainingBudgetAmongDescendantsCache();

    const actionableWorkspaces = await this.getActionableWorkspaces(userId);

    if (!actionableWorkspaces || !(actionableWorkspaces.length > 0)) {
      this.schedule.leaveCurrentWorkspace(userId);
      throw new Error("No eligible workspace");
    }

    const assignedWorkspace = pickRandomItemFromArray(actionableWorkspaces);

    await this.schedule.assignWorkspaceToUser({
      userId,
      workspace: assignedWorkspace,
      isOracle: false,
    });
  }

  public leaveCurrentWorkspace(userId) {
    this.schedule.leaveCurrentWorkspace(userId);
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
    let workspacesInTree = await this.fetchAllWorkspacesInTree(rootWorkspace);

    if (this.isInOracleMode) {
      workspacesInTree = workspacesInTree.filter(w => !w.isEligibleForOracle);
    }

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(workspacesInTree);

    const workspacesWithAtLeastMinBudget = await this.filterByWhetherHasMinBudget(workspacesNotCurrentlyBeingWorkedOn);

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = await this.filterByStaleness(workspacesWithAtLeastMinBudget);

    // filter by staleness IF there are some stale ones
    if (staleWorkspaces.length > 0) {
      eligibleWorkspaces = staleWorkspaces;
    }

    const workspaceWithLeastRemainingBudgetAmongDescendants = await this.getWorkspacesWithLeastRemainingBugetAmongDescendants(eligibleWorkspaces);

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
    return (workspace.totalBudget - workspace.allocatedBudget) >= 90;
  }
}

export { Scheduler };
