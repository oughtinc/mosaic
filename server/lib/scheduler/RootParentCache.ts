import * as models from "../models";

class RootParentCache {
  private static rootParentCache = new Map();

  public static clearRootParentCache() {
    this.rootParentCache = new Map();
  }

  public static async getRootParentOfWorkspace(workspace) {
    if (this.rootParentCache.has(workspace)) {
      return this.rootParentCache.get(workspace);
    }

    if (!workspace.parentId) {
      this.rootParentCache.set(workspace, workspace);
      return workspace;
    } else {
      const parent = models.Workspace.findById(parentId);
      const rootParent = await RootParentCache.getRootParentOfWorkspace(parent);
      this.rootParentCache.set(workspace, rootParent);
      return rootParent;
    }
  }
}

export { RootParentCache };
