import { isInOracleMode } from "../globals/isInOracleMode";
import { Workspace } from "../models";
import { DistanceFromWorkedOnWorkspaceCache } from "./DistanceFromWorkedOnWorkspaceCache";
import { NumberOfStaleDescendantsCache } from "./NumberOfStaleDescendantsCache";
import { RemainingBudgetAmongDescendantsCache } from "./RemainingBudgetAmongDescendantsCache";
import { RootParentCache } from "./RootParentCache";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

const NINETY_SECONDS = 1000 * 90;

//  By separating out fetchAllWorkspaces and rootParentCache, we 100% isolate
//  the rest of the scheduling code (Scheduler, Schedule, UserSchedule, and
//  Assignment classes) from Sequelize & Postgres

const fetchAllWorkspacesInTree = async (rootWorkspace) => {
  const result = [rootWorkspace];
  const children = await rootWorkspace.getChildWorkspaces({ where: { isArchived: false } });

  for (const child of children) {
    const allWorkspacesInChildsTree = await fetchAllWorkspacesInTree(child);
    result.push(...allWorkspacesInChildsTree);
  }
  return result;
}

const scheduler = new Scheduler({
  fetchAllWorkspacesInTree,
  fetchAllRootWorkspaces: async () => await Workspace.findAll({
    where: {
      parentId: null,
      isArchived: false,
      isEligibleForAssignment: true,
    }
  }),
  isInOracleMode,
  schedule: new Schedule({
    DistanceFromWorkedOnWorkspaceCache,
    rootParentCache: RootParentCache,
    timeLimit: NINETY_SECONDS,
  }),
  NumberOfStaleDescendantsCache,
  RemainingBudgetAmongDescendantsCache,
  rootParentCache: RootParentCache,
  timeLimit: NINETY_SECONDS,
});

export { scheduler };
