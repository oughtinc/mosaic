import * as _ from "lodash";
import Workspace from "../models/workspace";

class RootParentCache {
  private cache = new Map();

  public clearRootParentCache() {
    this.cache = new Map();
  }

  public async getRootParentOfWorkspace(workspace: Workspace) {
    const workspaceAlreadyCached = _.some(
      [...this.cache],
      ([workspaceId, rootParentId]) => workspaceId === workspace.id
    );

    if (workspaceAlreadyCached) {
      const workspaceId = this.cache.get(workspace.id);
      return await Workspace.findById(workspaceId);
    }

    if (!workspace.parentId) {
      this.cache.set(workspace.id, workspace.id);
      return workspace;
    } else {
      const parent = await Workspace.findById(workspace.parentId);
      if (parent === null) {
        return workspace;
      }

      const rootParent = await this.getRootParentOfWorkspace(parent);
      this.cache.set(workspace.id, rootParent.id);
      return rootParent;
    }
  }
}

export { RootParentCache };
