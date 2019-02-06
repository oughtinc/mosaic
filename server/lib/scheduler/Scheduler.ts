import { filter, map } from "asyncro";
import * as _ from "lodash";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private getFallbackScheduler;
  private fetchAllWorkspacesInTree;
  private fetchAllRootWorkspaces;
  private isInOracleMode;
  private numberOfStaleDescendantsCache;
  private NumberOfStaleDescendantsCache;
  private remainingBudgetAmongDescendantsCache;
  private RemainingBudgetAmongDescendantsCache;
  private rootParentCache;
  private schedule;
  private timeLimit;

  public constructor({
    getFallbackScheduler,
    fetchAllWorkspacesInTree,
    fetchAllRootWorkspaces,
    isInOracleMode,
    NumberOfStaleDescendantsCache,
    RemainingBudgetAmongDescendantsCache,
    rootParentCache,
    schedule,
    timeLimit,
  }) {
    this.getFallbackScheduler = getFallbackScheduler;
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.isInOracleMode = isInOracleMode;
    this.NumberOfStaleDescendantsCache = NumberOfStaleDescendantsCache;
    this.RemainingBudgetAmongDescendantsCache = RemainingBudgetAmongDescendantsCache;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
    this.timeLimit = timeLimit;
  }

  public async getUserActivity(userId) {
    return this.schedule.getUserActivity(userId);
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
    this.resetCaches();

    let treesToConsider = await this.fetchAllRootWorkspaces(1);
    let wasWorkspaceAssigned = false;

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);

      const workspacesInTree = await this.fetchAllWorkspacesInTree(randomlySelectedTree);

      let oracleEligibleWorkspaces = await this.filterByWhetherEligibleForOracle(workspacesInTree);
      oracleEligibleWorkspaces = await this.filterByWhetherAnsweredOrHasAncestorAnsweredByOracle(oracleEligibleWorkspaces);

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

  public async assignNextWorkspace(userId, maybeSuboptimal = false) {
    this.resetCaches();
    this.schedule.leaveCurrentWorkspace(userId);

    let actionableWorkspaces = await this.getActionableWorkspaces({ maybeSuboptimal, userId });

    if (actionableWorkspaces.length === 0 && maybeSuboptimal) {
      actionableWorkspaces = await this.getActionableWorkspaces({
        maybeSuboptimal: true,
        userId,
      });
    }

    if (actionableWorkspaces.length === 0) {
      const fallbackScheduler = await this.getFallbackScheduler();
      if (fallbackScheduler) {
        const assignedWorkspaceId = await fallbackScheduler.assignNextWorkspace({
          maybeSuboptimal, 
          userId,
        });

        return assignedWorkspaceId;
      }
    
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

    return assignedWorkspace.id;
  }

  public async assignNextMaybeSuboptimalWorkspace(userId) {
    await this.assignNextWorkspace(userId, true);
  }

  public async leaveCurrentWorkspace(userId) {
    this.schedule.leaveCurrentWorkspace(userId);

    const fallbackScheduler = await this.getFallbackScheduler();
    if (fallbackScheduler) {
      await fallbackScheduler.leaveCurrentWorkspace(userId);
    }
  }

  public reset(){
    this.schedule.reset();
  }

  private async getActionableWorkspaces({ 
    maybeSuboptimal, 
    userId,
  }) {
    let treesToConsider = await this.fetchAllRootWorkspaces();

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(userId, treesToConsider);
      const randomlySelectedTree = pickRandomItemFromArray(leastRecentlyWorkedOnTreesToConsider);
      const actionableWorkspaces = await this.getActionableWorkspacesForTree({
        maybeSuboptimal,
        rootWorkspace: randomlySelectedTree,
        userId,
      });

      if (actionableWorkspaces.length > 0) {
        return actionableWorkspaces;
      } else {
        treesToConsider = _.difference(
          treesToConsider,
          [randomlySelectedTree]
        );
      }
    }

    // if already trying fallback return empty array
    return [];
  }

  private filterByWhetherEligibleForOracle(workspaces) {
    return workspaces.filter(w => w.isEligibleForOracle);
  }

  private async filterByWhetherNotEligibleForOracle(workspaces) {
    return workspaces.filter(w => !w.isEligibleForOracle);
  }

  private async filterByWhetherAnsweredOrHasAncestorAnsweredByOracle(workspaces) {
    return await filter(
      workspaces,
      async w => {
        if (w.wasAnsweredByOracle) {
          return false;
        }
        const hasAncestorAnsweredByOracle = await w.hasAncestorAnsweredByOracle;
        return !hasAncestorAnsweredByOracle;
      }
    );
  }

  private async getActionableWorkspacesForTree({
    maybeSuboptimal,
    rootWorkspace,
    userId,
  }) {
    let workspacesInTree = await this.fetchAllWorkspacesInTree(rootWorkspace);

    if (this.isInOracleMode.getValue()) {
      workspacesInTree = await this.filterByWhetherNotEligibleForOracle(workspacesInTree);
      workspacesInTree = await this.filterByWhetherAnsweredOrHasAncestorAnsweredByOracle(workspacesInTree);
    }

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(workspacesInTree);

    let workspacesWithAtLeastMinBudget = workspacesNotCurrentlyBeingWorkedOn;
    if (rootWorkspace.hasTimeBudget) {
      workspacesWithAtLeastMinBudget = await this.filterByWhetherHasMinBudget(workspacesNotCurrentlyBeingWorkedOn);
    }

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = await this.filterByStaleness(userId, workspacesWithAtLeastMinBudget);

    eligibleWorkspaces = staleWorkspaces;
    
    const previouslyWorkedOnWorkspaces = this.getWorkspacesPreviouslyWorkedOnByUser({ userId, workspaces: eligibleWorkspaces });
    if (previouslyWorkedOnWorkspaces.length > 0 && !rootWorkspace.hasTimeBudget) {
      eligibleWorkspaces = previouslyWorkedOnWorkspaces;
    } else {
      const workspacesExceedingDistCuoff = await this.getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
        minDist: maybeSuboptimal ? 1 : 2,
        userId,
        workspaces: eligibleWorkspaces,
        workspacesInTree,
      });

      eligibleWorkspaces = workspacesExceedingDistCuoff;
    }

    let workspaceWithLeastRequiredWorkAmongDescendants = eligibleWorkspaces;
    if (rootWorkspace.hasTimeBudget) {
      workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithLeastRemainingBugetAmongDescendants(eligibleWorkspaces);
    } else if (rootWorkspace.hasIOConstraints) {
      workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithFewestStaleDescendants(eligibleWorkspaces);
    }

    const workspacesWithMostDistFromWorkedOnWorkspace = this.getWorkspacesWithMostDistFromWorkedOnWorkspace({
      shouldResetCache: false,
      userId,
      workspaces: workspaceWithLeastRequiredWorkAmongDescendants,
      workspacesInTree,
    });

    const finalWorkspaces = workspacesWithMostDistFromWorkedOnWorkspace;

    return finalWorkspaces;
  }

  private async filterByStaleness(userId, workspaces) {
    const staleWorkspaces = workspaces.filter(w => {
      const isStale = w.isStale;
      const isStaleForUser = w.isNotStaleRelativeToUser.indexOf(userId) === -1;
      return isStale && isStaleForUser;
    })
    return staleWorkspaces;
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

  private getWorkspacesPreviouslyWorkedOnByUser({ userId, workspaces }) {
    return this.schedule.getWorkspacesPreviouslyWorkedOnByUser({ userId, workspaces });
  }

  private getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
    minDist,
    shouldResetCache = true,
    userId,
    workspaces,
    workspacesInTree,
  }) {
    return this.schedule.getWorkspacesExceedingMinDistFromWorkedOnWorkspace({
      minDist,
      shouldResetCache,
      userId,
      workspaces, 
      workspacesInTree,
    });
  }

  private getWorkspacesWithMostDistFromWorkedOnWorkspace({
    shouldResetCache = true,
    userId,
    workspaces,
    workspacesInTree,
  }) {
    return this.schedule.getWorkspacesWithMostDistFromWorkedOnWorkspace({
      shouldResetCache,  
      userId,
      workspaces, 
      workspacesInTree,
    });
  }

  private resetCaches() {
    this.rootParentCache.clearRootParentCache();
    this.remainingBudgetAmongDescendantsCache = new this.RemainingBudgetAmongDescendantsCache();
    this.numberOfStaleDescendantsCache = new this.NumberOfStaleDescendantsCache();
  }
}

export { Scheduler };
