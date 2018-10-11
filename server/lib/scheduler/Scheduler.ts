import { filter } from "asyncro";
import { pickRandomItemFromArray } from "../utils/pickRandomItemFromArray";

class Scheduler {
  private fetchAllWorkspacesInTree;
  private fetchAllRootWorkspaces;
  private rootParentCache;
  private schedule;

  public constructor({ fetchAllWorkspacesInTree, fetchAllRootWorkspaces, rootParentCache, schedule }) {
    this.fetchAllWorkspacesInTree = fetchAllWorkspacesInTree;
    this.fetchAllRootWorkspaces = fetchAllRootWorkspaces;
    this.rootParentCache = rootParentCache;
    this.schedule = schedule;
  }

  public async getIdOfCurrentWorkspace(userId) {
    const assignment = this.schedule.getMostRecentAssignmentForUser(userId);
    return assignment.getWorkspace().id;
  }

  public async assignNextWorkspace(userId) {
    // clear cache so we don't use old eligibility info
    this.rootParentCache.clearRootParentCache();
    const actionableWorkspaces = await this.getActionableWorkspaces();
    const assignedWorkspace = pickRandomItemFromArray(actionableWorkspaces);
    await this.schedule.assignWorkspaceToUser(userId, assignedWorkspace);
  }

  private async getActionableWorkspaces() {
    const workspacesInTreesWorkedOnLeastRecently = await this.getWorkspacesInTreesWorkedOnLeastRecently();
    const eligibleWorkspaces = await this.filterByEligibility(workspacesInTreesWorkedOnLeastRecently);
    const notYetWorkedOn = await this.filterByWhetherNotYetWorkedOn(eligibleWorkspaces);
    let finalWorkspaces = notYetWorkedOn;

    // if every workspace in that tree has been worked on
    // then instead look for workspaces with remaining budgets
    if (finalWorkspaces.length === 0) {
      finalWorkspaces = await this.filterByWhetherHasRemainingBudget(eligibleWorkspaces);
    }

    // if every workspace in that tree has 0 remaining budget
    // then instead look for the workspace worked on least recently
    if (finalWorkspaces.length === 0) {
      const workspaceWorkedOnLeastRecently = await this.schedule.getLeastRecentlyActiveWorkspace(eligibleWorkspaces);
      return [workspaceWorkedOnLeastRecently];
    }

    return finalWorkspaces;
  }

  private async getTreesWorkedOnLeastRecently() {
    const rootWorkspaces = await this.fetchAllRootWorkspaces();
    return await filter(
      rootWorkspaces,
      async w => await this.schedule.isInTreeWorkedOnLeastRecently(
        rootWorkspaces,
        w
      )
    );
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

  private async filterByEligibility(workspaces) {
    const isMarkedEligible = w => this.isWorkspaceEligible(w);
    const isCurrentlyBeingWorkedOn = w => this.schedule.isWorkspaceCurrentlyBeingWorkedOn(w);
    return workspaces.filter(w => isMarkedEligible(w) && !isCurrentlyBeingWorkedOn(w));
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  private async filterByWhetherInTreeWorkedOnLeastRecently(workspaces) {
    let workspacesInTreeWorkedOnLeastRecently = [];

    for (const workspace of workspaces) {
      const shouldInclude = await this.schedule.isInTreeWorkedOnLeastRecently(workspaces, workspace);
      if (shouldInclude) {
        workspacesInTreeWorkedOnLeastRecently.push(workspace);
      }
    }

    return workspacesInTreeWorkedOnLeastRecently;
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
