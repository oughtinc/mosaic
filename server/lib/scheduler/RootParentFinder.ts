import * as models from "../models";

class RootParentFinder {
  private static RootParentCache = {};

  public static clearRootParentCache() {
    this.rootParentCache = {};
  }

  public static async getRootParentOfWorkspace(workspaceId, workspace) {
    if (this.rootParentCache[workspaceId]) {
      return this.rootParentCache[workspaceId];
    }

    if (!workspace) {
      workspace = await models.Workspace.findById(workspaceId);
    }

    if (!workspace.parentId) {
      this.rootParentCache[workspaceId] = workspace;
      return workspace;
    } else {
      const rootParent = await this.getRootParentOfWorkspace(workspace.parentId);
      this.rootParentCache[workspaceId] = rootParent;
      return rootParent;
    }
  }

  public static async getRootParentIdOfWorkspace(workspaceId) {
    if (this.rootParentCache[workspaceId]) {
      return this.rootParentCache[workspaceId].id;
    }

    const workspace = await models.Workspace.findById(workspaceId);

    if (!workspace.parentId) {
      this.rootParentCache[workspaceId] = workspace;
      return workspace.id;
    } else {
      const rootParent = await this.getRootParentOfWorkspace(workspace.parentId);
      this.rootParentCache[workspaceId] = rootParent;
      return rootParent.id;
    }
  }
}

export { RootParentFinder };
