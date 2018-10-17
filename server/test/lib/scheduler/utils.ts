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

export const remainingBudgetAmongDescendantsCacheFake = {
  clearRemainingBudgetAmongDescendantsCache() {},

  async getRemainingBudgetAmongDescendants(workspace) {
    const result = workspaces
      .filter(w => w.id !== workspace.id) // exclude self
      .filter(w => w.id.slice(0, workspace.id.length) === workspace.id) // exclude non-descendant
      .reduce((remainingBudgetSoFar, descendant) => {
        return remainingBudgetSoFar + remainingBudget(descendant);
      }, 0);

    return result;
  },
}

export const workspaces = [
  { id: "1", totalBudget: 1000, allocatedBudget: 751, isStale: false },
  { id: "1-1", totalBudget: 500, allocatedBudget: 251, isStale: false },
  { id: "1-1-1", totalBudget: 250, allocatedBudget: 100, isStale: false },
  { id: "2", totalBudget: 1000, allocatedBudget: 801, isStale: false },
  { id: "2-1", totalBudget: 400, allocatedBudget: 50, isStale: false },
  { id: "2-2", totalBudget: 400, allocatedBudget: 10, isStale: false },
  { id: "3", totalBudget: 1000, allocatedBudget: 1, isStale: false },
  { id: "4", totalBudget: 1000, allocatedBudget: 100, isStale: false },
  { id: "5", totalBudget: 1000, allocatedBudget: 801, isStale: false },
  { id: "5-1", totalBudget: 200, allocatedBudget: 10, isStale: false },
  { id: "5-2", totalBudget: 200, allocatedBudget: 200, isStale: false },
  { id: "5-3", totalBudget: 200, allocatedBudget: 5, isStale: false },
  { id: "5-4", totalBudget: 200, allocatedBudget: 1, isStale: false },
];

workspaces.get = id => {
  return workspaces.find(w => w.id === id);
}

function remainingBudget(workspace) {
  return workspace.totalBudget - workspace.allocatedBudget;
}
