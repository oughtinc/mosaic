import * as _ from "lodash";
import { filter } from "asyncro";
import { isInOracleMode } from "../globals/isInOracleMode";
import { Experiment, Tree, Workspace } from "../models";
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

export const schedulers = new Map();

export async function createScheduler(experimentId) {
  const scheduler = new Scheduler({
    fetchAllWorkspacesInTree,
    fetchAllRootWorkspaces: async () => {
      const rootWorkspaces = await Workspace.findAll({
        where: {
          parentId: null,
          isArchived: false,
        }
      });
      
      const eligibleRootWorkspaces = await filter(
        rootWorkspaces,
        async w => {
          const tree = await Tree.findOne({
            where: {
              rootWorkspaceId: w.id,
            },
          });
  
          if (!tree) {
            return false;
          }
  
          const experiments = await tree.getExperiments();
          
          if (_.some(experiments, e => e.id === experimentId)) {
            return true;
          }
  
          return false;
        }
      );
  
      return eligibleRootWorkspaces;
    },
    getFallbackScheduler: async () => {
      let fallback;
      let fallbackScheduler;

      const experiment = await Experiment.findById(experimentId);
      const fallbacks = await experiment.getFallbacks();
      
      if (fallbacks.length === 0) {
        fallbackScheduler = null;
      } else {
        fallback = fallbacks[0];

        if (schedulers.has(fallback.id)) {
          fallbackScheduler = schedulers.get(fallback.id);
        } else {
          fallbackScheduler = await createScheduler(fallback.id);
        }

        return fallbackScheduler;
      }
    },
    isInOracleMode,
    schedule: new Schedule({
      DistanceFromWorkedOnWorkspaceCache,
      rootParentCache: new RootParentCache(),
      timeLimit: NINETY_SECONDS,
    }),
    NumberOfStaleDescendantsCache,
    RemainingBudgetAmongDescendantsCache,
    rootParentCache: new RootParentCache(),
    timeLimit: NINETY_SECONDS,
  });

  schedulers.set(experimentId, scheduler);

  return scheduler;
}
