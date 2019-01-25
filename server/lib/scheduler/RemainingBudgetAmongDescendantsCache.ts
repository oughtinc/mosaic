import * as _ from "lodash";
import * as models from "../models";

class RemainingBudgetAmongDescendantsCache {
  private cache = new Map();

  public clearRemainingBudgetAmongDescendantsCache() {
    this.cache = new Map();
  }

  public async getRemainingBudgetAmongDescendants(workspace) {
    const workspaceAlreadyCached = this.cache.has(workspace.id);

    if (workspaceAlreadyCached) {
      return this.cache.get(workspace.id);
    }

    const children = await workspace.getChildWorkspaces();

    if (children.length === 0) {
      this.cache.set(workspace.id, 0);
      return 0;
    } else {
      let result = 0;
      for (const child of children) {
        result += child.totalBudget - child.allocatedBudget;
        result += await this.getRemainingBudgetAmongDescendants(child);
      }

      this.cache.set(workspace.id, result);
      return result;
    }
  }
}

export { RemainingBudgetAmongDescendantsCache };
