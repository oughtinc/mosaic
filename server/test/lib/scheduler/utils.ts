const uuidv4 = require("uuid/v4");

export const USER_ID = uuidv4();
export const USER_ID_1 = uuidv4();
export const USER_ID_2 = uuidv4();
export const WORKSPACE_ID = uuidv4();
export const WORKSPACE_ID_1 = uuidv4();
export const WORKSPACE_ID_2 = uuidv4();
export const WORKSPACE_ID_3 = uuidv4();

export const rootParentCacheFake = {
  clearRootParentCache() {},

  async getRootParentIdOfWorkspace(workspaceId) {
    return workspaceId[0];
  },
};
