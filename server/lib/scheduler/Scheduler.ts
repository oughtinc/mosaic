import { filter, map } from "asyncro";
import * as _ from "lodash";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private experimentId;
  private getFallbackScheduler;
  private fetchAllWorkspacesInTree;
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

  public async assignNextWorkspace(userId, maybeSuboptimal = false) {
    this.resetCaches();
    this.schedule.leaveCurrentWorkspace(userId);

    let actionableWorkspaces;
    if (this.isInOracleMode.getValue()) {
      actionableWorkspaces = await this.getActionableWorkspacesInOracleMode({
        maybeSuboptimal: false,
        userId,
      });
    } else {
      actionableWorkspaces = await this.getActionableWorkspaces({
        maybeSuboptimal: false,
        userId,
      });
    }

    if (actionableWorkspaces.length === 0 && maybeSuboptimal) {
      if (this.isInOracleMode.getValue()) {
        actionableWorkspaces = await this.getActionableWorkspacesInOracleMode({
          maybeSuboptimal: true,
          userId,
        });
      } else {
        actionableWorkspaces = await this.getActionableWorkspaces({
          maybeSuboptimal: true,
          userId,
        });
      }
    }

    if (actionableWorkspaces.length === 0) {
      const fallbackScheduler = await this.getFallbackScheduler();
      if (fallbackScheduler) {
        const assignedWorkspaceId = await fallbackScheduler.assignNextWorkspace(
          userId,
          maybeSuboptimal,
        );

        return assignedWorkspaceId;
      }

      throw new Error("No eligible workspace");
    }

    const shuffledActionableWorkspaces = _.shuffle(actionableWorkspaces);
    for (const candidateWorkspace of shuffledActionableWorkspaces) {
      // This is intended to mitigate a race condition where two users
      // are both looking for a new assignment at the same time and
      // get assigned to the same workspace due to async code in the scheduler
      if (
        !this.schedule.isWorkspaceCurrentlyBeingWorkedOn(candidateWorkspace)
      ) {
        const isThisAssignmentTimed = await candidateWorkspace.hasTimeBudgetOfRootParent;
        await this.schedule.assignWorkspaceToUser({
          experimentId: this.experimentId,
          userId,
          workspace: candidateWorkspace,
          isOracle: false,
          isLastAssignmentTimed: isThisAssignmentTimed,
        });

        return candidateWorkspace.id;
      }
    }
    return await this.assignNextWorkspace(userId, maybeSuboptimal);
  }

  public async isWorkspaceAvailable(userId: string) {
    this.resetCaches();

    let actionableWorkspaces;
    if (this.isInOracleMode.getValue()) {
      actionableWorkspaces = await this.getActionableWorkspacesInOracleMode({
        maybeSuboptimal: false,
        userId,
      });
    } else {
      actionableWorkspaces = await this.getActionableWorkspaces({
        maybeSuboptimal: false,
        userId,
      });
    }

    if (actionableWorkspaces.length === 0) {
      const fallbackScheduler = await this.getFallbackScheduler();
      if (fallbackScheduler) {
        return await fallbackScheduler.isWorkspaceAvailable(userId);
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  public async assignNextMaybeSuboptimalWorkspace(userId) {
    return await this.assignNextWorkspace(userId, true);
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

  // Possible alternative approach:
  // What if you just took a random sample of root workspaces and checked them
  // Need to consider MIB, but putting that aside for now
  // Essentially, what is the likelihood a 1/n set of workspaces have an available tree
  // Or could you consider a tree
  private async getActionableWorkspaces({ maybeSuboptimal, userId }) {
    let treesToConsider = await this.fetchAllRootWorkspaces();

    while (treesToConsider.length > 0) {
      const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(
        userId,
        treesToConsider,
      );
      const randomlySelectedTree = pickRandomItemFromArray(
        leastRecentlyWorkedOnTreesToConsider,
      );
      const actionableWorkspaces = await this.getActionableWorkspacesForTree({
        maybeSuboptimal,
        rootWorkspace: randomlySelectedTree,
        userId,
      });

      if (actionableWorkspaces.length > 0) {
        return actionableWorkspaces;
      } else {
        treesToConsider = _.difference(treesToConsider, [randomlySelectedTree]);
      }
    }

    // if already trying fallback return empty array
    return [];
  }

  private getTreesWithHighestPriority(trees) {
    const highestPriority = Math.min(...trees.map(t => t.schedulingPriority));
    return trees.filter(t => t.schedulingPriority === highestPriority);
  }

  private async getActionableWorkspacesInOracleMode({
    maybeSuboptimal,
    userId,
  }) {
    let treesToConsider = await this.fetchAllRootWorkspaces();

    while (treesToConsider.length > 0) {
      const highestPriorityTrees = this.getTreesWithHighestPriority(
        treesToConsider,
      );

      let oracleTreesToConsider = await filter(
        highestPriorityTrees,
        async t => {
          const isHonestOracle = await this.isUserHonestOracleForRootWorkspace(
            userId,
            t,
          );
          const isMaliciousOracle = await this.isUserMaliciousOracleForRootWorkspace(
            userId,
            t,
          );
          return isHonestOracle || isMaliciousOracle;
        },
      );

      let nonOracleTreesToConsider = _.difference(
        highestPriorityTrees,
        oracleTreesToConsider,
      );

      while (oracleTreesToConsider.length > 0) {
        const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(
          userId,
          oracleTreesToConsider,
        );
        const randomlySelectedTree = pickRandomItemFromArray(
          leastRecentlyWorkedOnTreesToConsider,
        );
        const workspacesInTree = await this.fetchAllWorkspacesInTree(
          randomlySelectedTree,
        );

        const isHonestOracle = await this.isUserHonestOracleForRootWorkspace(
          userId,
          randomlySelectedTree,
        );
        const isMaliciousOracle = await this.isUserMaliciousOracleForRootWorkspace(
          userId,
          randomlySelectedTree,
        );

        let oracleEligibleWorkspaces = workspacesInTree;
        if (isHonestOracle) {
          oracleEligibleWorkspaces = await this.filterByWhetherEligibleForHonestOracle(
            workspacesInTree,
          );
        } else {
          oracleEligibleWorkspaces = await this.filterByWhetherEligibleForMaliciousOracle(
            workspacesInTree,
          );
        }

        oracleEligibleWorkspaces = await this.filterByStaleness(
          userId,
          oracleEligibleWorkspaces,
        );

        const workspacesToConsider = await this.filterByWhetherCurrentlyBeingWorkedOn(
          oracleEligibleWorkspaces,
        );

        // we want to prioritize older workspaces
        workspacesToConsider.sort((w1, w2) => w1.createdAt - w2.createdAt);

        const actionableWorkspaces = workspacesToConsider[0]
          ? [workspacesToConsider[0]]
          : [];

        if (actionableWorkspaces.length > 0) {
          return actionableWorkspaces;
        } else {
          oracleTreesToConsider = _.difference(oracleTreesToConsider, [
            randomlySelectedTree,
          ]);
        }
      }

      while (nonOracleTreesToConsider.length > 0) {
        const leastRecentlyWorkedOnTreesToConsider = await this.getTreesWorkedOnLeastRecentlyByUser(
          userId,
          nonOracleTreesToConsider,
        );
        const randomlySelectedTree = pickRandomItemFromArray(
          leastRecentlyWorkedOnTreesToConsider,
        );
        const actionableWorkspaces = await this.getActionableWorkspacesForTree({
          maybeSuboptimal,
          rootWorkspace: randomlySelectedTree,
          userId,
        });

        if (actionableWorkspaces.length > 0) {
          return actionableWorkspaces;
        } else {
          nonOracleTreesToConsider = _.difference(nonOracleTreesToConsider, [
            randomlySelectedTree,
          ]);
        }
      }

      treesToConsider = _.difference(treesToConsider, highestPriorityTrees);
    }

    return [];
  }

  private filterByWhetherEligibleForHonestOracle(workspaces) {
    return workspaces.filter(w => w.isEligibleForHonestOracle);
  }

  private filterByWhetherEligibleForMaliciousOracle(workspaces) {
    return workspaces.filter(w => w.isEligibleForMaliciousOracle);
  }

  private async filterByWhetherNotEligibleForOracle(workspaces) {
    return workspaces.filter(
      w => !w.isEligibleForHonestOracle && !w.isEligibleForMaliciousOracle,
    );
  }

  private async filterByWhetherAnsweredByOracle(workspaces) {
    return workspaces.filter(w => !w.wasAnsweredByOracle);
  }

  private async getActionableWorkspacesForTree({
    maybeSuboptimal,
    rootWorkspace,
    userId,
  }) {
    const allWorkspacesInTree = await this.fetchAllWorkspacesInTree(
      rootWorkspace,
    );

    let workspacesInTree = allWorkspacesInTree;
    if (this.isInOracleMode.getValue()) {
      workspacesInTree = await this.filterByWhetherNotEligibleForOracle(
        allWorkspacesInTree,
      );
      workspacesInTree = await this.filterByWhetherAnsweredByOracle(
        workspacesInTree,
      );
    }

    const workspacesNotCurrentlyBeingWorkedOn = await this.filterByWhetherCurrentlyBeingWorkedOn(
      workspacesInTree,
    );

    let workspacesWithAtLeastMinBudget = workspacesNotCurrentlyBeingWorkedOn;
    if (rootWorkspace.hasTimeBudget) {
      workspacesWithAtLeastMinBudget = await this.filterByWhetherHasMinBudget(
        workspacesNotCurrentlyBeingWorkedOn,
      );
    }

    let eligibleWorkspaces = workspacesWithAtLeastMinBudget;

    const staleWorkspaces = await this.filterByStaleness(
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

  private async filterByStaleness(userId, workspaces) {
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

  private async getTreesWorkedOnLeastRecentlyByUser(userId, rootWorkspaces) {
    const treesWorkedOnLeastRecentlyByUser = this.schedule.getTreesWorkedOnLeastRecentlyByUser(
      rootWorkspaces,
      userId,
    );
    return treesWorkedOnLeastRecentlyByUser;
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
