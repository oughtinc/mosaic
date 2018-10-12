import * as _ from "lodash";
import * as models from "../models";

class RootParentCache {
  private static rootParentCache = new Map();

  public static clearRootParentCache() {
    this.rootParentCache = new Map();
  }

  public static async getRootParentOfWorkspace(workspace) {
    const workspaceAlreadyCached = _.some(
      [...this.rootParentCache],
      ([w, rootParent]) => w.id === workspace.id
    );

    if (workspaceAlreadyCached) {
      return this.rootParentCache.get(workspace);
    }

    if (!workspace.parentId) {
      this.rootParentCache.set(workspace, workspace);
      return workspace;
    } else {
      const parent = models.Workspace.findById(workspace.parentId);
      const rootParent = await RootParentCache.getRootParentOfWorkspace(parent);
      this.rootParentCache.set(workspace, rootParent);
      return rootParent;
    }
  }
}

export { RootParentCache };
