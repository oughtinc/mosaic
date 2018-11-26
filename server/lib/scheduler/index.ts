import { isInOracleMode } from "../globals/isInOracleMode";
import { Workspace } from "../models";
import { RemainingBudgetAmongDescendantsCache } from "./RemainingBudgetAmongDescendantsCache";
import { RootParentCache } from "./RootParentCache";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

const NINETY_SECONDS = 90 * 1000;

//  By separating out fetchAllWorkspaces and rootParentCache, we 100% isolate
//  the rest of the scheduling code (Scheduler, Schedule, UserSchedule, and
//  Assignment classes) from Sequelize & Postgres

const fetchAllWorkspacesInTree = async rootWorkspace => {
  let result, children;
  if (isInOracleMode.getValue()) {
    result = rootWorkspace.isEligibleForOracle ? [] : [rootWorkspace];
    children = await rootWorkspace.getChildWorkspaces({
      where: {
        isEligibleForOracle: false,
      }
    });
  } else {
    result = [rootWorkspace];
    children = await rootWorkspace.getChildWorkspaces();
  }

  for (const child of children) {
    const allWorkspacesInChildsTree = await fetchAllWorkspacesInTree(child);
    result.push(...allWorkspacesInChildsTree);
  }
  return result;
},

const scheduler = new Scheduler({
  fetchAllWorkspacesInTree,
  fetchAllRootWorkspaces: async () => await Workspace.findAll({
    where: {
      parentId: null,
      isEligibleForAssignment: true,
    }
  }),
  schedule: new Schedule({ rootParentCache: RootParentCache, timeLimit: NINETY_SECONDS }),
  remainingBudgetAmongDescendantsCache: RemainingBudgetAmongDescendantsCache,
  rootParentCache: RootParentCache,
  timeLimit: NINETY_SECONDS,
});

export { scheduler };
