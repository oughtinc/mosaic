import * as _ from "lodash";
import * as models from "../models";

class NumberOfStaleDescendantsCache {
  private static cache = new Map();

  public static clearNumberOfStaleDescendantsCache() {
    this.cache = new Map();
  }

  public static async getNumberOfStaleDescendants(workspace) {
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
        if (child.isStale) {
          result += 1;
        }

        result += await NumberOfStaleDescendantsCache.getNumberOfStaleDescendants(child);
      }

      this.cache.set(workspace.id, result);
      return result;
    }
  }
}

export { NumberOfStaleDescendantsCache };
