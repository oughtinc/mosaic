import * as _ from "lodash";
import * as models from "../models";

interface Workspace {
  id: string;
  isStale: boolean;
  wasAnsweredByOracle: boolean;
  getChildWorkspaces(): Workspace[];
}

class NumberOfStaleDescendantsCache {
  private static cache = new Map();

  public static clearNumberOfStaleDescendantsCache() {
    this.cache = new Map();
  }

  public static async getNumberOfStaleDescendants(workspace: Workspace): Promise<number> {
    const workspaceAlreadyCached: boolean = this.cache.has(workspace.id);

    if (workspaceAlreadyCached) {
      return this.cache.get(workspace.id);
    }

    const numberOfStaleDescendants: number = await this.calculateNumberOfStaleDescendants(workspace);

    this.cache.set(workspace.id, numberOfStaleDescendants);

    return numberOfStaleDescendants;
  }

  private static async calculateNumberOfStaleDescendants(workspace: Workspace): Promise<number> {
    const children = await workspace.getChildWorkspaces();

    if (children.length === 0) {
      this.cache.set(workspace.id, 0);
      return 0;
    } else {
      let result: number = 0;
      for (const child of children) {
        if (!child.wasAnsweredByOracle) {
          if (child.isStale) {
            result += 1;
          }

          result += await NumberOfStaleDescendantsCache.getNumberOfStaleDescendants(child);
        }
      }

      return result;
    }
  }
}

export { NumberOfStaleDescendantsCache };
