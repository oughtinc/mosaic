import { filter, map } from "asyncro";
import * as _ from "lodash";
import Tree from "../models/tree";
import Workspace from "../models/workspace";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private experimentId;
  private getFallbackScheduler;
  private fetchAllWorkspacesInTree;
  private fetchTreesAvailableToUser;
  private fetchAllRootWorkspaces;
  private isInOracleMode;
  private isUserHonestOracleForRootWorkspace;
  private isUserMaliciousOracleForRootWorkspace;
  private numberOfStaleDescendantsCache;
  private NumberOfStaleDescendantsCache;
  private remainingBudgetAmongDescendantsCache;
  private RemainingBudgetAmongDescendantsCache;
  private rootParentCache;
  private schedule;
  private timeLimit;

  public constructor({
    experimentId,
    getFallbackScheduler,
    fetchAllWorkspacesInTree,
    fetchTreesAvailableToUser,
    fetchAllRootWorkspaces,
    isInOracleMode,
    isUserHonestOracleForRootWorkspace,
    isUserMaliciousOracleForRootWorkspace,
    NumberOfStaleDescendantsCache,
    RemainingBudgetAmongDescendantsCache,
    rootParentCache,
    schedule,
    timeLimit,
  }) {
    this.experimentId = experimentId;
    this.getFallbackScheduler = getFallbackScheduler;
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.fetchTreesAvailableToUser = fetchTreesAvailableToUser;
    this.isInOracleMode = isInOracleMode;
    this.isUserHonestOracleForRootWorkspace = isUserHonestOracleForRootWorkspace;
    this.isUserMaliciousOracleForRootWorkspace = isUserMaliciousOracleForRootWorkspace;
    this.NumberOfStaleDescendantsCache = NumberOfStaleDescendantsCache;
    this.RemainingBudgetAmongDescendantsCache = RemainingBudgetAmongDescendantsCache;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
    this.timeLimit = timeLimit;
  }

  public async getIdOfCurrentlyActiveUser(workspaceId) {
    const result = this.schedule.getIdOfCurrentlyActiveUserForWorkspace(
      workspaceId,
    );

    if (!result) {
      const fallbackScheduler = await this.getFallbackScheduler();
      if (fallbackScheduler) {
        const fallbackResult = await fallbackScheduler.getIdOfCurrentlyActiveUser(
          workspaceId,
        );
        return fallbackResult;
      }
      return result;
    } else {
      return result;
    }
  }

  public isThisFirstTimeWorkspaceHasBeenWorkedOn(workspaceId) {
    return this.schedule.isThisFirstTimeWorkspaceHasBeenWorkedOn(workspaceId);
  }

  public async getUserActivity(userId) {
    const thisSchedulerUserActivity = await this.schedule.getUserActivity(
      userId,
    );
    const fallbackScheduler = await this.getFallbackScheduler();
    const fallbackSchedulerUserActivity = fallbackScheduler
      ? await fallbackScheduler.getUserActivity(userId)
      : [];

    const mergedUserActivity = thisSchedulerUserActivity.concat(
      fallbackSchedulerUserActivity,
    );

    return mergedUserActivity;
  }

  public async getWorkspaceActivity(workspaceId) {
    const thisSchedulerWorkspaceActivity = await this.schedule.getWorkspaceActivity(
      workspaceId,
    );
    const fallbackScheduler = await this.getFallbackScheduler();
    const fallbackSchedulerWorkspaceActivity = fallbackScheduler
      ? await fallbackScheduler.getWorkspaceActivity(workspaceId)
      : [];

    const mergedUserActivity = thisSchedulerWorkspaceActivity.concat(
      fallbackSchedulerWorkspaceActivity,
    );

    return mergedUserActivity;
  }

  public async isUserCurrentlyWorkingOnWorkspace(userId, workspaceId) {
    const result = this.schedule.isUserCurrentlyWorkingOnWorkspace(
      userId,
      workspaceId,
    );

    if (!result) {
      const fallbackScheduler = await this.getFallbackScheduler();
      if (fallbackScheduler) {
        const fallbackResult = await fallbackScheduler.isUserCurrentlyWorkingOnWorkspace(
          userId,
          workspaceId,
        );
        return fallbackResult;
      }
      return result;
    } else {
      return result;
    }
  }

  public async assignNextWorkspace(userId: string): Promise<string | null> {
    this.resetCaches();
    this.schedule.leaveCurrentWorkspace(userId);

    // Should always be in oracle mode
    if (!this.isInOracleMode.getValue()) {
      throw new Error(
        "Not in Oracle Mode. If you see this, please contact us.",
      );
    }

    const actionableWorkspace = await this.getActionableWorkspaceInOracleMode(
      userId,
    );

    if (!actionableWorkspace) {
      return null;
    }
    const isLastAssignmentTimed = await actionableWorkspace.hasTimeBudgetOfRootParent;

    if (!this.schedule.isWorkspaceCurrentlyBeingWorkedOn(actionableWorkspace)) {
      await this.schedule.assignWorkspaceToUser({
        experimentId: this.experimentId,
        userId,
        workspace: actionableWorkspace,
        isOracle: false,
        isLastAssignmentTimed,
      });
      return actionableWorkspace.id;
    } else {
      return await this.assignNextWorkspace(userId);
    }

    // Fallback scheduler not in use
    // const fallbackScheduler = await this.getFallbackScheduler();
    // if (fallbackScheduler) {
    //   const assignedWorkspaceId = await fallbackScheduler.assignNextWorkspace(
    //     userId,
    //   );
    //   return assignedWorkspaceId;
    // }
  }

  public async isWorkspaceAvailable(userId: string) {
    // Notification system deprecated
    // this.resetCaches();
    // const actionableWorkspaces = await this.getActionableWorkspacesInOracleMode(
    //   userId,
    // );
    // if (actionableWorkspaces.length === 0) {
    //   const fallbackScheduler = await this.getFallbackScheduler();
    //   if (fallbackScheduler) {
    //     return await fallbackScheduler.isWorkspaceAvailable(userId);
    //   } else {
    //     return false;
    //   }
    // } else {
    //   return true;
    // }
  }

  public async assignNextMaybeSuboptimalWorkspace(userId) {
    // deprecated, suboptimality is controlled within getActionableWorkspaces for speed
    return await this.assignNextWorkspace(userId);
  }

  public async leaveCurrentWorkspace(userId) {
    this.schedule.leaveCurrentWorkspace(userId);

    const fallbackScheduler = await this.getFallbackScheduler();
    if (fallbackScheduler) {
      await fallbackScheduler.leaveCurrentWorkspace(userId);
    }
  }

  public reset() {
    this.schedule.reset();
  }

  private getTreesWithHighestPriority(trees: Tree[]) {
    const highestPriority = Math.min(...trees.map(t => t.schedulingPriority));
    return trees.filter(t => t.schedulingPriority === highestPriority);
  }

  private async getActionableWorkspaceInOracleMode(
    userId: string,
  ): Promise<Workspace | null> {
    let treesToConsider: Tree[] = await this.fetchTreesAvailableToUser(userId);

    while (treesToConsider.length > 0) {
      const highestPriorityTrees = this.getTreesWithHighestPriority(
        treesToConsider,
      );

      const oracleTrees = await filter(highestPriorityTrees, t => {
        return t.oracleRelations.length > 0;
      });

      let oracleTreesToConsider = oracleTrees;

      while (oracleTreesToConsider.length > 0) {
        const randomlySelectedRootWorkspace = this.getRandomTreeRootWorkspaceWorkedOnLeastRecentlyByUser(
          userId,
          oracleTreesToConsider,
        );
        const selectedTree: Tree = _.find(oracleTreesToConsider, tree => {
          return tree.rootWorkspace.id === randomlySelectedRootWorkspace.id;
        });

        const isMaliciousInTree: boolean =
          selectedTree.oracleRelations[0].isMalicious;

        const workspacesInTree: Workspace[] = await this.fetchAllWorkspacesInTree(
          randomlySelectedRootWorkspace,
        );

        let oracleEligibleWorkspaces: Workspace[] = isMaliciousInTree
          ? this.filterByWhetherEligibleForMaliciousOracle(workspacesInTree)
          : this.filterByWhetherEligibleForHonestOracle(workspacesInTree);

        oracleEligibleWorkspaces = this.filterByStaleness(
          userId,
          oracleEligibleWorkspaces,
        );
        // we want to prioritize older workspaces
        oracleEligibleWorkspaces.sort((w1, w2) => w1.createdAt - w2.createdAt);
        for (const oracleWorkspace of oracleEligibleWorkspaces) {
          // This is intended to mitigate a race condition where two users
          // are both looking for a new assignment at the same time and
          // get assigned to the same workspace due to async code in the scheduler
          if (
            !this.schedule.isWorkspaceCurrentlyBeingWorkedOn(oracleWorkspace)
          ) {
            return oracleWorkspace;
          }
        }

        oracleTreesToConsider = _.difference(oracleTreesToConsider, [
          selectedTree,
        ]);
      }

      let judgeTreesToConsider = _.difference(
        highestPriorityTrees,
        oracleTrees,
      );

      while (judgeTreesToConsider.length > 0) {
        const randomlySelectedRootWorkspace = this.getRandomTreeRootWorkspaceWorkedOnLeastRecentlyByUser(
          userId,
          judgeTreesToConsider,
        );

        const judgeEligibleWorkspaces = await this.getActionableWorkspacesForTree(
          randomlySelectedRootWorkspace,
          userId,
        );

        for (const judgeWorkpace of judgeEligibleWorkspaces) {
          if (!this.schedule.isWorkspaceCurrentlyBeingWorkedOn(judgeWorkpace)) {
            return judgeWorkpace;
          }
        }
        const selectedTree: Tree = _.find(judgeTreesToConsider, tree => {
          return tree.rootWorkspace.id === randomlySelectedRootWorkspace.id;
        });

        judgeTreesToConsider = _.difference(judgeTreesToConsider, [
          selectedTree,
        ]);
      }

      treesToConsider = _.difference(treesToConsider, highestPriorityTrees);
    }

    return null;
  }

  private filterByWhetherEligibleForHonestOracle(workspaces) {
    return workspaces.filter(w => w.isEligibleForHonestOracle);
  }

  private filterByWhetherEligibleForMaliciousOracle(workspaces) {
    return workspaces.filter(w => w.isEligibleForMaliciousOracle);
  }

  private filterByWhetherNotEligibleForOracle(workspaces) {
    return workspaces.filter(
      w => !w.isEligibleForHonestOracle && !w.isEligibleForMaliciousOracle,
    );
  }

  private filterByWhetherAnsweredByOracle(workspaces) {
    return workspaces.filter(w => !w.wasAnsweredByOracle);
  }

  private async getActionableWorkspacesForTree(
    rootWorkspace: Workspace,
    userId: string,
  ): Promise<Workspace[]> {
    const allWorkspacesInTree = await this.fetchAllWorkspacesInTree(
      rootWorkspace,
    );

    let workspacesInTree = allWorkspacesInTree;
    if (this.isInOracleMode.getValue()) {
      workspacesInTree = this.filterByWhetherNotEligibleForOracle(
        allWorkspacesInTree,
      );
      workspacesInTree = this.filterByWhetherAnsweredByOracle(workspacesInTree);
    }

    let workspacesWithAtLeastMinBudget = workspacesInTree;
    if (rootWorkspace.hasTimeBudget) {
      workspacesWithAtLeastMinBudget = this.filterByWhetherHasMinBudget(
        workspacesInTree,
      );
    }

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = this.filterByStaleness(
      userId,
      workspacesWithAtLeastMinBudget,
    );

    eligibleWorkspaces = staleWorkspaces;

    const previouslyWorkedOnWorkspaces = this.getWorkspacesPreviouslyWorkedOnByUser(
      { userId, workspaces: eligibleWorkspaces },
    );
    if (
      previouslyWorkedOnWorkspaces.length > 0 &&
      !rootWorkspace.hasTimeBudget
    ) {
      eligibleWorkspaces = previouslyWorkedOnWorkspaces;
    } else {
      const maybeSuboptimal = false;
      const workspacesExceedingDistCuoff = await this.getWorkspacesExceedingMinDistFromWorkedOnWorkspace(
        {
          minDist: maybeSuboptimal ? 1 : 2,
          userId,
          workspaces: eligibleWorkspaces,
          workspacesInTree: allWorkspacesInTree,
        },
      );

      eligibleWorkspaces = workspacesExceedingDistCuoff;
    }

    let workspaceWithLeastRequiredWorkAmongDescendants = eligibleWorkspaces;
    if (rootWorkspace.hasTimeBudget) {
      workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithLeastRemainingBugetAmongDescendants(
        eligibleWorkspaces,
      );
    } else if (rootWorkspace.hasIOConstraints) {
      workspaceWithLeastRequiredWorkAmongDescendants = await this.getWorkspacesWithFewestStaleDescendants(
        eligibleWorkspaces,
      );
    }

    const workspacesWithMostDistFromWorkedOnWorkspace = this.getWorkspacesWithMostDistFromWorkedOnWorkspace(
      {
        userId,
        workspaces: workspaceWithLeastRequiredWorkAmongDescendants,
        workspacesInTree: allWorkspacesInTree,
      },
    );

    const finalWorkspaces = workspacesWithMostDistFromWorkedOnWorkspace;

    return finalWorkspaces;
  }

  private filterByStaleness(
    userId: string,
    workspaces: Workspace[],
  ): Workspace[] {
    const staleWorkspaces = workspaces.filter(w => {
      const isStale = w.isStale;
      const isStaleForUser = w.isNotStaleRelativeToUser.indexOf(userId) === -1;
      return isStale && isStaleForUser;
    });
    return staleWorkspaces;
  }

  private async getWorkspacesWithLeastRemainingBugetAmongDescendants(
    workspaces,
  ) {
    const workspacesWithRemainingDescendantBudget = await map(
      workspaces,
      async w => {
        const remainingBudgetAmongDescendants = await this.remainingBudgetAmongDescendantsCache.getRemainingBudgetAmongDescendants(
          w,
        );

        return {
          remainingBudgetAmongDescendants,
          workspace: w,
        };
      },
    );

    const minLeastRemainingBudgetAmongDescendants = _.min(
      workspacesWithRemainingDescendantBudget.map(
        o => o.remainingBudgetAmongDescendants,
      ),
    );

    const workspacesToReturn = workspacesWithRemainingDescendantBudget
      .filter(
        o =>
          o.remainingBudgetAmongDescendants ===
          minLeastRemainingBudgetAmongDescendants,
      )
      .map(o => o.workspace);

    return workspacesToReturn;
  }

  private async getWorkspacesWithFewestStaleDescendants(workspaces) {
    const workspacesWithNumberOfStaleDescendants = await map(
      workspaces,
      async w => {
        const numberOfStaleDescendants = await this.numberOfStaleDescendantsCache.getNumberOfStaleDescendants(
          w,
        );

        return {
          numberOfStaleDescendants,
          workspace: w,
        };
      },
    );

    const minNumberOfStaleDescendants = _.min(
      workspacesWithNumberOfStaleDescendants.map(
        o => o.numberOfStaleDescendants,
      ),
    );

    const workspacesToReturn = workspacesWithNumberOfStaleDescendants
      .filter(o => o.numberOfStaleDescendants === minNumberOfStaleDescendants)
      .map(o => o.workspace);

    return workspacesToReturn;
  }

  private getRandomTreeRootWorkspaceWorkedOnLeastRecentlyByUser(
    userId: string,
    trees: Tree[],
  ): Workspace {
    const rootWorkspacesOfTrees: Workspace[] = trees.map(t => t.rootWorkspace);
    const treesWorkedOnLeastRecentlyByUser = this.schedule.getTreesWorkedOnLeastRecentlyByUser(
      rootWorkspacesOfTrees,
      userId,
    );
    const rootWorkspace = pickRandomItemFromArray(
      treesWorkedOnLeastRecentlyByUser,
    );
    if (!rootWorkspace) {
      throw new Error(
        "Unable to retrieve workspace from least recently worked on trees",
      );
    }
    return rootWorkspace;
  }

  private async filterByWhetherCurrentlyBeingWorkedOn(workspaces) {
    return workspaces.filter(
      w => !this.schedule.isWorkspaceCurrentlyBeingWorkedOn(w),
    );
  }

  private filterByWhetherHasMinBudget(workspaces) {
    return workspaces.filter(w => this.hasMinRemaining(w));
  }

  private async filterByWhetherNotYetWorkedOn(workspaces) {
    return await filter(
      workspaces,
      async w => !(await this.schedule.hasWorkspaceBeenWorkedOnYet(w)),
    );
  }

  private hasMinRemaining(workspace) {
    return workspace.totalBudget - workspace.allocatedBudget >= 90;
  }

  private getWorkspacesPreviouslyWorkedOnByUser({ userId, workspaces }) {
    return this.schedule.getWorkspacesPreviouslyWorkedOnByUser({
      userId,
      workspaces,
    });
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
