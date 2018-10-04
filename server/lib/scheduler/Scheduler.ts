import { filter, map } from "asyncro";

class Scheduler {
  private fetchAllWorkspaces;
  private rootParentFinder;
  private schedule;

  public constructor({ fetchAllWorkspaces, rootParentFinder, schedule }) {
    this.fetchAllWorkspaces = fetchAllWorkspaces;
    this.rootParentFinder = rootParentFinder;
    this.schedule = schedule;
  }

  public async getCurrentWorkspace(userId) {
    const assignment = this.schedule.getMostRecentAssignmentForUser(userId);
    return assignment.getWorkspaceId();
  }

  public async findNextWorkspace(userId) {
    // clear cache so we don't use old eligibility info
    this.rootParentFinder.clearRootParentCache();
    const workspacesThatCouldBeNext = await this.getWorkspacesThatCouldBeNext(userId);
    const idsOfWorkspacesThatCouldBeNext = workspacesThatCouldBeNext.map(w => w.id);
    const assignedWorkspaceId = this.pickWorkspaceIdAtRandom(idsOfWorkspacesThatCouldBeNext);
    this.schedule.assignWorkspaceToUser(userId, assignedWorkspaceId);
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
      const workspaceWorkedOnLeastRecently = await this.schedule.getWhichOfTheseWorkspacesWorkedOnLeastRecently(workspacesInTreeWorkedOnLeastRecently);
      finalWorkspaces = [workspaceWorkedOnLeastRecently];
    }

    return finalWorkspaces;
  }

  private async pickWorkspaceIdAtRandom(workspaceIds) {
    const randomIndex = Math.floor(Math.random() * (workspaceIds.length));
    return workspaceIds[randomIndex];
  }

  private async filterByEligibility(workspaces) {
    // use for... of instead of asyncro's filter
    // because isWorkspaceEligible will use rootParentFinder
    // and the parallel nature of filter doesn't work with
    // rootParentFinder's caching
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
      async (w) => !await this.schedule.hasWorkspaceBeenWorkedOnYet(w.id)
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
