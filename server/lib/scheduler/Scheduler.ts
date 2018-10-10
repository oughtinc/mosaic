import { filter } from "asyncro";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private fetchAllWorkspaces;
  private rootParentCache;
  private schedule;

  public constructor({ fetchAllWorkspaces, rootParentCache, schedule }) {
    this.fetchAllWorkspaces = fetchAllWorkspaces;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
  }

  public async getIdOfCurrentWorkspace(userId) {
    const assignment = this.schedule.getMostRecentAssignmentForUser(userId);
    return assignment.getWorkspaceId();
  }

  public async findNextWorkspace(userId) {
    // clear cache so we don't use old eligibility info
    this.rootParentCache.clearRootParentCache();
    const workspacesThatCouldBeNext = await this.getWorkspacesThatCouldBeNext(userId);
    const assignedWorkspace = pickRandomItemFromArray(workspacesThatCouldBeNext);
    const assignedWorkspaceId = assignedWorkspace.id;
    await this.schedule.assignWorkspaceToUser(userId, assignedWorkspaceId);
  }

  private async getWorkspacesThatCouldBeNext(userId) {
    const allWorkspaces = await this.fetchAllWorkspaces();
    const allEligibleWorkspaces = await this.filterByEligibility(allWorkspaces);
    const workspacesInTreeWorkedOnLeastRecently = await this.filterByWhetherInTreeWorkedOnLeastRecently(allEligibleWorkspaces);
    const notYetWorkedOnInThatTree = await this.filterByWhetherNotYetWorkedOn(workspacesInTreeWorkedOnLeastRecently);

    let finalWorkspaces = notYetWorkedOnInThatTree;

    // if every workspace in that tree has been worked on
    // then instead look for workspaces with remaining budgets
    if (finalWorkspaces.length === 0) {
      finalWorkspaces = await this.filterByWhetherHasRemainingBudget(workspacesInTreeWorkedOnLeastRecently);
    }

    // if every workspace in that tree has 0 remaining budget
    // then instead look for the workspace worked on least recently
    if (finalWorkspaces.length === 0) {
      const idOfWorkspaceWorkedOnLeastRecently = await this.schedule.getLeastRecentlyActiveWorkspace(workspacesInTreeWorkedOnLeastRecently.map(w => w.id));
      return [idOfWorkspaceWorkedOnLeastRecently];
    }

    return finalWorkspaces;
  }

  private async filterByEligibility(workspaces) {
    // use for... of instead of asyncro's filter
    // because isWorkspaceEligible will use rootParentCache
    // and the parallel nature of filter doesn't work with
    // rootParentCache's caching
    let allEligibleWorkspaces = [];
    for (const workspace of workspaces) {
      const isMarkedEligible = await this.isWorkspaceEligible(workspace);
      const isCurrentlyBeingWorkedOn = await this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace.id);
      if (isMarkedEligible && !isCurrentlyBeingWorkedOn) {
        allEligibleWorkspaces.push(workspace);
      }
    }
    return allEligibleWorkspaces;
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  private async filterByWhetherInTreeWorkedOnLeastRecently(workspaces) {
    let workspacesInTreeWorkedOnLeastRecently = [];

    for (const workspace of workspaces) {
      const shouldInclude = await this.schedule.isInTreeWorkedOnLeastRecently(workspaces.map(w => w.id), workspace.id);
      if (shouldInclude) {
        workspacesInTreeWorkedOnLeastRecently.push(workspace);
      }
    }

    return workspacesInTreeWorkedOnLeastRecently;
  }

  private async filterByWhetherNotYetWorkedOn(workspaces) {
    return await filter(
      workspaces,
      async w => !await this.schedule.hasWorkspaceBeenWorkedOnYet(w.id)
    );
  }

  private filterByWhetherHasRemainingBudget(workspaces) {
    return workspaces.filter(w => this.hasRemainingBudgetForChildren(w));
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
