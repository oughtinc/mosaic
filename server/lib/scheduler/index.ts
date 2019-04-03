import Assignment from "../models/assignment";

const uuidv4 = require("uuid/v4");
import * as _ from "lodash";
import { filter, map } from "asyncro";
import { isInOracleMode } from "../globals/isInOracleMode";
import { DistanceFromWorkedOnWorkspaceCache } from "./DistanceFromWorkedOnWorkspaceCache";
import { NumberOfStaleDescendantsCache } from "./NumberOfStaleDescendantsCache";
import { RemainingBudgetAmongDescendantsCache } from "./RemainingBudgetAmongDescendantsCache";
import { RootParentCache } from "./RootParentCache";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";
import Workspace from "../models/workspace";
import UserTreeOracleRelation from "../models/userTreeOracleRelation";
import Tree from "../models/tree";
import Experiment from "../models/experiment";

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
  const schedule = new Schedule({
    fetchAllAssignmentsInExperiment: async () => {
      const assignments = await Assignment.findAll({
        where: {
          experimentId,
        },
      });
      const enhancedAssignments = await map(
        assignments,
        async a => {
          const workspace = await Workspace.findById(a.workspaceId);
          return {
            ...{
              ...a.dataValues,
              startAtTimestamp: Number(a.dataValues.startAtTimestamp),
              endAtTimestamp: a.dataValues.endAtTimestamp ? Number(a.dataValues.endAtTimestamp) : Date.now(),
            },
            workspace
          };
        },
      );

      return enhancedAssignments;
    },
    // createAssignment is not async because it occurs in a constructor
    // and I want to pass id on
    // TODO: figure out better way to do this
    createAssignment: fields => {
      const id = uuidv4();
      Assignment.create({ ...fields, id });
      return id;
    },
    updateAssignment: async (id, fields) => {
      const assignment = await Assignment.findById(id);
      if (assignment === null) {
        return;
      }
      await assignment.update(fields);
    },
    DistanceFromWorkedOnWorkspaceCache,
    rootParentCache: new RootParentCache(),
    timeLimit: NINETY_SECONDS,
  });

  await schedule.initialize();

  const scheduler = new Scheduler({
    experimentId,
    fetchAllWorkspacesInTree,
    isUserHonestOracleForRootWorkspace: async (userId, rootWorkspace) => {
      const tree = await rootWorkspace.getTree();
      const userTreeOracleRelation = await UserTreeOracleRelation.findOne({
        where: {
          TreeId: tree.id,
          UserId: userId,
        },
      });
      return userTreeOracleRelation && !userTreeOracleRelation.isMalicious;
    },
    isUserMaliciousOracleForRootWorkspace: async (userId, rootWorkspace) => {
      const tree = await rootWorkspace.getTree();
      const userTreeOracleRelation = await UserTreeOracleRelation.findOne({
        where: {
          TreeId: tree.id,
          UserId: userId,
        },
      });
      return userTreeOracleRelation && userTreeOracleRelation.isMalicious;
    },
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
  
          const experiments = await tree.$get("experiments") as Experiment[];
          
          return _.some(experiments, e => e.id === experimentId);
        }
      );
  
      return eligibleRootWorkspaces;
    },
    getFallbackScheduler: async () => {
      let fallback;
      let fallbackScheduler;

      const experiment = await Experiment.findById(experimentId);
      if (experiment === null) {
        return null;
      }
      
      const fallbacks = await experiment.$get("fallbacks") as Experiment[];
      
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
    schedule,
    NumberOfStaleDescendantsCache,
    RemainingBudgetAmongDescendantsCache,
    rootParentCache: new RootParentCache(),
    timeLimit: NINETY_SECONDS,
  });

  schedulers.set(experimentId, scheduler);

  return scheduler;
}
