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

  async getRootParentOfWorkspace(workspace) {
    return workspaces.find(w => w.id === workspace.id[0]);
  },
};

export const workspaces = [
  { id: "1", totalBudget: 100, allocatedBudget: 100 },
  { id: "1-1", totalBudget: 49, allocatedBudget: 49 },
  { id: "1-1-1", totalBudget: 100, allocatedBudget: 100 },
  { id: "2", totalBudget: 100, allocatedBudget: 50 },
  { id: "2-1", totalBudget: 100, allocatedBudget: 50 },
  { id: "2-2", totalBudget: 100, allocatedBudget: 0 },
  { id: "3", totalBudget: 100, allocatedBudget: 50 },
  { id: "4", totalBudget: 100, allocatedBudget: 50 },
  { id: "5", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-1", totalBudget: 100, allocatedBudget: 0 },
  { id: "5-2", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-3", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-4", totalBudget: 100, allocatedBudget: 100 },
];

workspaces.get = id => {
  return workspaces.find(w => w.id === id);
}
