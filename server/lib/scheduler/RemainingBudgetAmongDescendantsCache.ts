import * as _ from "lodash";
import * as models from "../models";

class RemainingBudgetAmongDescendantsCache {
  private static cache = new Map();

  public static clearRemainingBudgetAmongDescendantsCache() {
    this.cache = new Map();
  }

  public static async getRemainingBudgetAmongDescendants(workspace) {
    const workspaceAlreadyCached = _.some(
      [...this.cache],
      ([w, remainingBudgetAmongDescendants]) => w.id === workspace.id
    );

    if (workspaceAlreadyCached) {
      return this.cache.get(workspace);
    }

    const children = await workspace.getChildWorkspaces();

    if (children.length === 0) {
      this.cache.set(workspace, 0);
      return 0;
    } else {
      let result = 0;
      for (const child of children) {
        result += child.totalBudget - child.allocatedBudget;
        result += await RemainingBudgetAmongDescendantsCache.getRemainingBudgetAmongDescendants(child);
      }

      this.cache.set(workspace, result);
      return result;
    }
  }
}

export { RemainingBudgetAmongDescendantsCache };
