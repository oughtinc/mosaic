const uuidv4 = require("uuid/v4");

export const USER_ID = uuidv4();
export const USER_ID_1 = uuidv4();
export const USER_ID_2 = uuidv4();
export const WORKSPACE_ID = uuidv4();
export const WORKSPACE_ID_1 = uuidv4();
export const WORKSPACE_ID_2 = uuidv4();
export const WORKSPACE_ID_3 = uuidv4();

const NINETY_SECONDS = 90 * 1000;

export const timeLimit = NINETY_SECONDS;

export const rootParentCacheFake = {
  clearRootParentCache() {},

  async getRootParentOfWorkspace(workspace) {
    return workspaces.find(w => w.id === workspace.id[0]);
  },
};

export const remainingBudgetAmongDescendantsCacheFake = {
  clearRemainingBudgetAmongDescendantsCache() {},

  getRemainingBudgetAmongDescendants(workspace){
    const id = workspace.id;
    
    if (id === "1") return 290 + 190;
    if (id === "1-1") return 190;
    if (id === "1-1-1") return 0;
    if (id === "2") return 230 + 220;
    if (id === "2-1") return 0;
    if (id === "2-2") return 0;
    if (id === "3") return 0;
    if (id === "4") return 0;
    if (id === "5") return 250 + 150 + 50 + 0;
    if (id === "5-1") return 0;
    if (id === "5-2") return 0;
    if (id === "5-3") return 0;
    if (id === "5-4") return 0;
  }
};

export const workspaces = [
  { id: "1", totalBudget: 1000, allocatedBudget: 490 },
  { id: "1-1", totalBudget: 490, allocatedBudget: 200 },
  { id: "1-1-1", totalBudget: 200, allocatedBudget: 10 },
  { id: "2", totalBudget: 1000, allocatedBudget: 510 },
  { id: "2-1", totalBudget: 260, allocatedBudget: 30 },
  { id: "2-2", totalBudget: 250, allocatedBudget: 30 },
  { id: "3", totalBudget: 1000, allocatedBudget: 900 },
  { id: "4", totalBudget: 1000, allocatedBudget: 0 },
  { id: "5", totalBudget: 1000, allocatedBudget: 850 },
  { id: "5-1", totalBudget: 250, allocatedBudget: 0 },
  { id: "5-2", totalBudget: 200, allocatedBudget: 50 },
  { id: "5-3", totalBudget: 200, allocatedBudget: 150 },
  { id: "5-4", totalBudget: 200, allocatedBudget: 200 },
];

workspaces.get = id => {
  return workspaces.find(w => w.id === id);
}
