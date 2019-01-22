import { filter, map } from "asyncro";
import * as _ from "lodash";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private fetchAllWorkspacesInTree;
  private fetchAllRootWorkspaces;
  private isInOracleMode;
  private numberOfStaleDescendantsCache;
  private remainingBudgetAmongDescendantsCache;
  private rootParentCache;
  private schedule;
  private timeLimit;

  public constructor({
    fetchAllWorkspacesInTree,
    fetchAllRootWorkspaces,
    isInOracleMode,
    numberOfStaleDescendantsCache,
    remainingBudgetAmongDescendantsCache,
    rootParentCache,
    schedule,
    timeLimit,
  }) {
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.isInOracleMode = isInOracleMode;
    this.numberOfStaleDescendantsCache = numberOfStaleDescendantsCache;
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
    this.numberOfStaleDescendantsCache.clearNumberOfStaleDescendantsCache();

    let treesToConsider = await this.fetchAllRootWorkspaces();
    let wasWorkspaceAssigned = false;

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);

      const workspacesInTree = await this.fetchAllWorkspacesInTree(randomlySelectedTree);

      const oracleEligibleWorkspaces = await filter(
        workspacesInTree,
        async w => {
          if (w.isEligibleForOracle && !w.wasAnsweredByOracle) {
            const hasAncestorAnsweredByOracle = await w.hasAncestorAnsweredByOracle;
            return !hasAncestorAnsweredByOracle;
          }
          return false;
        }
      );

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
          isLastAssignmentTimed: true,
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
    this.numberOfStaleDescendantsCache.clearNumberOfStaleDescendantsCache();

    let actionableWorkspaces = await this.getActionableWorkspaces({ userId });

    if (actionableWorkspaces.length === 0) {
      actionableWorkspaces = await this.getActionableWorkspaces({ userId, considerNonStale: true });
    }

    if (actionableWorkspaces.length === 0) {
      this.schedule.leaveCurrentWorkspace(userId);
      throw new Error("No eligible workspace");
    }

    const assignedWorkspace = pickRandomItemFromArray(actionableWorkspaces);
    const isThisAssignmentTimed = await assignedWorkspace.hasTimeBudgetOfRootParent;

    await this.schedule.assignWorkspaceToUser({
      userId,
      workspace: assignedWorkspace,
      isOracle: false,
      isLastAssignmentTimed: isThisAssignmentTimed,
    });
  }

  public leaveCurrentWorkspace(userId) {
    this.schedule.leaveCurrentWorkspace(userId);
  }

  public reset(){
    this.schedule.reset();
  }

  private async getActionableWorkspaces({ userId, considerNonStale = false }) {
     let treesToConsider = await this.fetchAllRootWorkspaces();

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);
      const actionableWorkspaces = await this.getActionableWorkspacesForTree(userId, randomlySelectedTree, considerNonStale);

      if (actionableWorkspaces.length > 0) {
        return actionableWorkspaces;
      } else {
        treesToConsider = _.difference(
          treesToConsider,
          [randomlySelectedTree]
        );
      }
    }

    // if you've made it here, then you've looked through each tree for actionable
    // workspaces, and each time found none
    return [];
  }

  private async getActionableWorkspacesForTree(userId, rootWorkspace, considerNonStale) {
    let workspacesInTree = await this.fetchAllWorkspacesInTree(rootWorkspace);

    if (this.isInOracleMode.getValue()) {
      workspacesInTree = await filter(
        workspacesInTree,
        async w => {
          if (!w.isEligibleForOracle && !w.wasAnsweredByOracle) {
            const hasAncestorAnsweredByOracle = await w.hasAncestorAnsweredByOracle;
            return !hasAncestorAnsweredByOracle;
          }
          return false;
        }
      );
    }

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(workspacesInTree);

    let workspacesWithAtLeastMinBudget = workspacesNotCurrentlyBeingWorkedOn;
    if (rootWorkspace.hasTimeBudget) {
      workspacesWithAtLeastMinBudget = await this.filterByWhetherHasMinBudget(workspacesNotCurrentlyBeingWorkedOn);
    }

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = await this.filterByStaleness(workspacesWithAtLeastMinBudget);

    // filter by staleness IF there are some stale ones
    if (staleWorkspaces.length > 0) {
      eligibleWorkspaces = staleWorkspaces;
    }
    
    // if no stale worksapces, and not considering non-stale,
    // go ahead and return
    if(staleWorkspaces.length === 0 && !considerNonStale) {
      return [];
    }

    let workspacesWithMostDistFromWorkedOnWorkspace = await this.getWorkspacesWithMostDistFromWorkedOnWorkspace({
      userId,
      workspaces: eligibleWorkspaces,
      workspacesInTree,
    });

    // let workspaceWithLeastRequiredWorkAmongDescendants = eligibleWorkspaces;
    // if (rootWorkspace.hasTimeBudget) {
    //   workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithLeastRemainingBugetAmongDescendants(eligibleWorkspaces);
    // } else if (rootWorkspace.hasIOConstraints) {
    //   workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithFewestStaleDescendants(eligibleWorkspaces);
    // }

    const finalWorkspaces = workspacesWithMostDistFromWorkedOnWorkspace;

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

  private async getWorkspacesWithFewestStaleDescendants(workspaces) {
    const workspacesWithNumberOfStaleDescendants = await map(
      workspaces,
      async w => {
        const numberOfStaleDescendants = await this.numberOfStaleDescendantsCache.getNumberOfStaleDescendants(w);

        return {
            numberOfStaleDescendants,
            workspace: w,
        };
      }
    );

    const minNumberOfStaleDescendants = _.min(
      workspacesWithNumberOfStaleDescendants.map(o => o.numberOfStaleDescendants)
    );

    const workspacesToReturn = workspacesWithNumberOfStaleDescendants
      .filter(o => o.numberOfStaleDescendants === minNumberOfStaleDescendants)
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

  private getWorkspacesWithMostDistFromWorkedOnWorkspace({
    userId,
    workspaces,
    workspacesInTree,
  }) {
    return this.schedule.getWorkspacesWithMostDistFromWorkedOnWorkspace({
      userId,
      workspaces, 
      workspacesInTree,
    });
  }
}

export { Scheduler };
