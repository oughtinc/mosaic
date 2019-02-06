import * as _ from "lodash";
import * as models from "../models";

class RootParentCache {
  private cache = new Map();

  public clearRootParentCache() {
    this.cache = new Map();
  }

  public async getRootParentOfWorkspace(workspace) {
    const workspaceAlreadyCached = _.some(
      [...this.cache],
      ([workspaceId, rootParentId]) => workspaceId === workspace.id
    );

    if (workspaceAlreadyCached) {
      const workspaceId = this.cache.get(workspace.id);
      return await models.Workspace.findById(workspaceId);
    }

    if (!workspace.parentId) {
      this.cache.set(workspace.id, workspace.id);
      return workspace;
    } else {
      const parent = await models.Workspace.findById(workspace.parentId);
      const rootParent = await this.getRootParentOfWorkspace(parent);
      this.cache.set(workspace.id, rootParent.id);
      return rootParent;
    }
  }
}

export { RootParentCache };
