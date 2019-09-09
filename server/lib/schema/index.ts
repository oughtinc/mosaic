import { isInOracleMode } from "../globals/isInOracleMode";
import * as _ from "lodash";
import { resolver, attributeFields } from "graphql-sequelize";
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import GraphQLJSON from "graphql-type-json";
import * as Sequelize from "sequelize";

import { requireAdmin, requireUser } from "./auth";

import { isUserAdmin } from "./auth/isUserAdmin";
import { userFromContext } from "./auth/userFromContext";

import { getMessageForUser } from "./helpers/getMessageForUser";
import { addExportsAndLinks } from "./helpers/addExportsAndLinks";
import { extractMaliciousAnswerValueFromMaliciousQuestionAndJudgeQuestion } from "./helpers/extractMaliciousAnswerValueFromMaliciousQuestionAndJudgeQuestion";
import { extractHonestAnswerValueFromMaliciousQuestion } from "./helpers/extractHonestAnswerValueFromMaliciousQuestion";
import { extractAnswerValueFromQuestion } from "./helpers/extractAnswerValueFromQuestion";

import getScheduler from "../scheduler";
import { map } from "asyncro";
import Assignment from "../models/assignment";
import Block from "../models/block";
import Snapshot from "../models/snapshot";
import Workspace from "../models/workspace";
import UserTreeOracleRelation from "../models/userTreeOracleRelation";
import User from "../models/user";
import Experiment from "../models/experiment";
import Instructions, { InstructionTypes } from "../models/instructions";
import Tree from "../models/tree";
import Pointer from "../models/pointer";
import PointerImport from "../models/pointerImport";
import ExportWorkspaceLockRelation from "../models/exportWorkspaceLockRelation";
import NotificationRequest from "../models/notificationRequest";
import { generateJudgeQuestionValue } from "../models/helpers/generateJudgeQuestionValue";
import { generateMaliciousQuestionValue } from "../models/helpers/generateMaliciousQuestionValue";

const generateReferences = references => {
  const all = {};
  references.map(([fieldName, graphqlType]) => {
    all[fieldName] = {
      type: graphqlType(),
      resolve: async instance => await instance.$get(fieldName),
    };
  });
  return all;
};

export const makeObjectType = (model, references, extraFields = {}) =>
  new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () =>
      _.assign(
        attributeFields(model),
        generateReferences(references),
        extraFields,
      ),
  });

export const userType = makeObjectType(User, []);

const snapshotType = makeObjectType(Snapshot, [
  ["user", () => userType],
  ["workspace", () => workspaceType],
]);

const blockType = makeObjectType(Block, [["workspace", () => workspaceType]]);

export const workspaceType = makeObjectType(
  Workspace,
  [
    ["childWorkspaces", () => new GraphQLList(workspaceType)],
    ["parentWorkspace", () => workspaceType],
    ["blocks", () => new GraphQLList(blockType)],
    ["pointerImports", () => new GraphQLList(pointerImportType)],
    ["tree", () => treeType],
    ["assignments", () => new GraphQLList(assignmentType)],
  ],
  {
    isParentOracleWorkspace: {
      type: GraphQLBoolean,
      resolve: async (workspace: Workspace, args, context) => {
        if (!workspace.parentId) {
          return false;
        }

        const parent = await Workspace.findByPk(workspace.parentId);

        return (
          parent.isEligibleForHonestOracle ||
          parent.isEligibleForMaliciousOracle
        );
      },
    },
    parentSerialId: {
      type: GraphQLInt,
      resolve: async (workspace: Workspace, args, context) => {
        const parent = await Workspace.findByPk(workspace.parentId);
        return parent && parent.serialId;
      },
    },
    rootWorkspaceSerialId: {
      type: GraphQLInt,
      resolve: async (workspace: Workspace, args, context) => {
        const rootWorkspace = await Workspace.findByPk(
          workspace.rootWorkspaceId,
        );
        return rootWorkspace.serialId;
      },
    },
    message: {
      type: GraphQLString,
      resolve: async (workspace: Workspace, args, context) => {
        const user = await userFromContext(context);

        if (!user) {
          return null;
        }

        const rootWorkspace = await workspace.getRootWorkspace();

        // get experiment id
        const tree = (await rootWorkspace.$get("tree")) as Tree;
        const experiments = (await tree.$get("experiments")) as Experiment[];
        if (experiments.length === 0) {
          return null;
        }

        const mostRecentExperiment = _.sortBy(
          experiments,
          e => -e.createdAt,
        )[0];
        const experimentId = mostRecentExperiment.id;

        const instructions = await Instructions.findAll({
          where: { experimentId },
        });
        const instructionValues = {};
        instructions.forEach(instruction => {
          instructionValues[instruction.type] = instruction.value;
        });

        if (workspace.isRequestingLazyUnlock) {
          return await getMessageForUser({
            isRequestingLazyUnlock: workspace.isRequestingLazyUnlock,
            instructions: instructionValues,
          });
        }

        const scheduler = await getScheduler(experimentId);
        const isWorkspaceRootLevel = !workspace.parentId;
        const isThisFirstTimeWorkspaceHasBeenWorkedOn = await scheduler.isThisFirstTimeWorkspaceHasBeenWorkedOn(
          workspace.id,
        );

        const userTreeOracleRelations = (await tree.$get(
          "oracleRelations",
        )) as UserTreeOracleRelation[];
        const thisUserTreeOracleRelation = userTreeOracleRelations.find(
          r => r.UserId === user.id,
        );

        const typeOfUser = !thisUserTreeOracleRelation
          ? "TYPICAL"
          : !thisUserTreeOracleRelation.isMalicious
          ? "HONEST"
          : "MALICIOUS";

        return await getMessageForUser({
          instructions: instructionValues,
          isWorkspaceRootLevel,
          isThisFirstTimeWorkspaceHasBeenWorkedOn,
          typeOfUser,
        });
      },
    },
    isUserOracleForTree: {
      type: GraphQLBoolean,
      resolve: async (workspace: Workspace, args, context) => {
        const user = await userFromContext(context);

        if (!user) {
          return false;
        }

        // get tree
        const rootWorkspace = await workspace.getRootWorkspace();
        const tree = (await rootWorkspace.$get("tree")) as Tree;
        const oracles = (await tree.$get("oracles")) as User[];

        return oracles.some(o => o.id === user.id);
      },
    },
    isUserMaliciousOracleForTree: {
      type: GraphQLBoolean,
      resolve: async (workspace: Workspace, args, context) => {
        const user = await userFromContext(context);

        if (!user) {
          return false;
        }

        // get tree
        const rootWorkspace = await workspace.getRootWorkspace();
        const tree = (await rootWorkspace.$get("tree")) as Tree;
        const userTreeOracleRelation = await UserTreeOracleRelation.findOne({
          where: {
            TreeId: tree.id,
            UserId: user.id,
          },
        });

        return userTreeOracleRelation && userTreeOracleRelation.isMalicious;
      },
    },
    currentlyActiveUser: {
      type: userType,
      resolve: async (workspace: Workspace, args, context) => {
        const rootWorkspace = await workspace.getRootWorkspace();

        // get experiment id
        const tree = (await rootWorkspace.$get("tree")) as Tree;
        const experiments = (await tree.$get("experiments")) as Experiment[];
        if (experiments.length === 0) {
          return null;
        }

        const mostRecentExperiment = _.sortBy(
          experiments,
          e => -e.createdAt,
        )[0];
        const experimentId = mostRecentExperiment.id;

        const scheduler = await getScheduler(experimentId);

        // get user
        const userId = await scheduler.getIdOfCurrentlyActiveUser(workspace.id);
        if (!userId) {
          return null;
        }

        let user = await User.findByPk(userId);

        if (!user) {
          user = {
            id: userId,
            givenName: null,
            familyName: null,
          };
        }

        return user;
      },
    },
    isNotStaleRelativeToUserFullInformation: {
      type: new GraphQLList(userType),
      resolve: async (workspace: Workspace, args, context) => {
        const fullInfo = await map(
          workspace.isNotStaleRelativeToUser,
          async userId => {
            let user = await User.findByPk(userId);
            if (!user) {
              const userInfo = await userFromContext(context);

              user = {
                id: userId,
                givenName: null,
                familyName: null,
              };
            }

            return user;
          },
        );

        return fullInfo;
      },
    },
    rootWorkspace: {
      get type() {
        return workspaceType;
      },
      resolve: async (workspace: Workspace) => {
        return await workspace.getRootWorkspace();
      },
    },
  },
);

import { UserActivityType } from "./UserActivity";
import { WorkspaceActivityType } from "./WorkspaceActivity";

const assignmentType = makeObjectType(Assignment, [
  ["snapshots", () => new GraphQLList(snapshotType)],
  ["user", () => userType],
  ["workspace", () => workspaceType],
]);

const OracleRelationsType = makeObjectType(UserTreeOracleRelation, [
  ["tree", () => treeType],
  ["user", () => userType],
]);

const treeType = makeObjectType(Tree, [
  ["rootWorkspace", () => workspaceType],
  ["experiments", () => new GraphQLList(experimentType)],
  ["oracleRelations", () => new GraphQLList(OracleRelationsType)],
  ["oracles", () => new GraphQLList(userType)],
]);

const instructionsEnumValues = {};
const instructionsFields = {};
InstructionTypes.forEach(type => {
  instructionsEnumValues[type] = {};
  instructionsFields[type] = { type: GraphQLString };
});

const instructionsEnumType = new GraphQLEnumType({
  name: "InstructionsEnum",
  values: instructionsEnumValues,
});

const instructionsObjectType = new GraphQLObjectType({
  name: "Instructions",
  fields: instructionsFields,
});

const experimentType = makeObjectType(
  Experiment,
  [
    ["fallbacks", () => new GraphQLList(experimentType)],
    ["trees", () => new GraphQLList(treeType)],
  ],
  {
    instructions: {
      type: instructionsObjectType,
      resolve: async (experiment: Experiment) => {
        const instructions = await Instructions.findAll({
          where: { experimentId: experiment.id },
        });
        const instructionValues = {};
        instructions.forEach(instruction => {
          instructionValues[instruction.type] = instruction.value;
        });
        return instructionValues;
      },
    },
  },
);

const pointerType = makeObjectType(Pointer, [
  ["pointerImport", () => pointerImportType],
  ["sourceBlock", () => blockType],
]);

const pointerImportType = makeObjectType(PointerImport, [
  ["workspace", () => blockType],
  ["pointer", () => pointerType],
]);

const BlockInput = new GraphQLInputObjectType({
  name: "blockInput",
  fields: _.pick(attributeFields(Block), "value", "id"),
});

const TreeInputForAPI = new GraphQLInputObjectType({
  name: "treeInputForAPI",
  fields: {
    rootLevelQuestion: { type: GraphQLString },
    rootLevelScratchpad: { type: GraphQLString },
    honestAnswer: { type: GraphQLString },
    maliciousAnswer: { type: GraphQLString },
    emailsOfHonestOracles: { type: new GraphQLList(GraphQLString) },
    emailsOfMaliciousOracles: { type: new GraphQLList(GraphQLString) },
    doesAllowJudgeToJudge: { type: GraphQLBoolean },
    isMIBWithoutRestarts: { type: GraphQLBoolean },
    schedulingPriority: { type: GraphQLInt },
    depthLimit: { type: GraphQLInt },
  },
});

const ExperimentInput = new GraphQLInputObjectType({
  name: "experimentInput",
  fields: {
    experimentName: { type: GraphQLString },
    experimentId: { type: GraphQLString },
    trees: { type: new GraphQLList(TreeInputForAPI) },
  },
});

const WorkspaceInput = new GraphQLInputObjectType({
  name: "WorkspaceInput",
  fields: attributeFields(Workspace, { allowNull: true }),
});

function modelGraphQLFields(type: any, model: any) {
  return {
    type,
    args: { where: { type: GraphQLJSON } },
    resolve: resolver(model),
  };
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      currentAssignmentId: {
        type: GraphQLString,
        args: {
          experimentId: { type: GraphQLString },
          userId: { type: GraphQLString },
          workspaceId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId, userId, workspaceId }) => {
          const workspace = await Workspace.findByPkOrSerialId(workspaceId);
          const experiment = await Experiment.findByPkOrSerialId(experimentId);

          if (!workspace || !experiment) {
            return;
          }

          const assignments = await Assignment.findAll({
            order: [["createdAt", "DESC"]],
            where: {
              experimentId: experiment.id,
              userId,
              workspaceId: workspace.id,
            },
          });

          if (assignments.length === 0) return;

          const scheduler = await getScheduler(experiment.id);

          const activeUserId = await scheduler.getIdOfCurrentlyActiveUser(
            workspace.id,
          );

          if (userId === activeUserId) {
            return assignments[0].id;
          }

          return;
        },
      },
      isUserRegisteredForNotifications: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId, userId }) => {
          const notificationRequest = await NotificationRequest.findAll({
            where: {
              experimentId,
              userId,
            },
          });

          return !!(notificationRequest && notificationRequest.length > 0);
        },
      },
      userActivity: {
        type: UserActivityType,
        args: {
          experimentId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId, userId }) => {
          const scheduler = await getScheduler(experimentId);
          return scheduler.getUserActivity(userId);
        },
      },
      workspaceActivity: {
        type: WorkspaceActivityType,
        args: {
          workspaceId: { type: GraphQLString },
        },
        resolve: async (__, { workspaceId }) => {
          const workspace = await Workspace.findByPkOrSerialId(workspaceId);
          const rootWorkspace = await workspace.getRootWorkspace();

          // get experiment id
          const tree = (await rootWorkspace.$get("tree")) as Tree;
          const experiments = (await tree.$get("experiments")) as Experiment[];
          if (experiments.length === 0) {
            return null;
          }

          const mostRecentExperiment = _.sortBy(
            experiments,
            e => -e.createdAt,
          )[0];
          const experimentId = mostRecentExperiment.id;

          const scheduler = await getScheduler(experimentId);

          return scheduler.getWorkspaceActivity(workspaceId);
        },
      },
      oracleMode: {
        type: GraphQLBoolean,
        resolve: function() {
          return isInOracleMode.getValue();
        },
      },
      workspaces: {
        type: new GraphQLList(workspaceType),
        args: { where: { type: GraphQLJSON } },
        resolve: resolver(Workspace, {
          before: async function(findOptions, args, context, info) {
            const user = await userFromContext(context);

            if (user == null) {
              findOptions.where = {
                isPublic: true,
                ...findOptions.where,
              };
            } else if (!user.isAdmin) {
              findOptions.where = {
                [Sequelize.Op.or]: [{ creatorId: user.id }, { isPublic: true }],
                ...findOptions.where,
              };
            }

            return findOptions;
          },
          after: async (result: Workspace[], args, ctx) => {
            // ensure root workspace has associated tree
            for (const workspace of result) {
              const tree = (await workspace.$get("tree")) as Tree;
              if (tree === null && !workspace.parentId) {
                await Tree.create({
                  rootWorkspaceId: workspace.id,
                });
              }
            }
            return result;
          },
        }),
      },
      workspace: {
        type: workspaceType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(Workspace, {
          before: async function(findOptions, args, context, info) {
            if (findOptions.where.id.length < 10) {
              return {
                ...findOptions,
                where: { serialId: Number(findOptions.where.id) },
              };
            }

            return findOptions;
          },
          after: async (result: Workspace, args, ctx) => {
            // ensure root workspace has associated tree
            const tree = await result.$get("tree");
            if (tree === null && !result.parentId) {
              const tree = await Tree.create({
                rootWorkspaceId: result.id,
              });
            }

            // On Thursday, Nov 1 2018, a workspace failed to load on the
            // frontend. When looking into this, it was clear that this
            // workspace only had a QUESTION block on the backend, and no
            // ANSWER or SCRATCHPAD block and that this was the reason for the
            // error on the frontend.

            // Unclear how this could have occurred. Probably a race condition.
            // But in order to prevent it
            // in the future, I added this graphql-sequelize "after" hook to
            // ensure the existence of the three required blocks.

            const blocks = (await result.$get("blocks")) as Block[];

            const includesQuestion = blocks.find(b => b.type === "QUESTION");
            const includesAnswer = blocks.find(b => b.type === "ANSWER");
            const includesScratchpad = blocks.find(
              b => b.type === "SCRATCHPAD",
            );
            const includesSubquestionDraft = blocks.find(
              b => b.type === "SUBQUESTION_DRAFT",
            );

            const includesAnswerDraft = blocks.find(
              b => b.type === "ANSWER_DRAFT",
            );

            const includesOracleAnswerCandidateDraft = blocks.find(
              b => b.type === "ORACLE_ANSWER_CANDIDATE",
            );

            const shouldIncludeOracleAnswerCandidateDraft =
              (result.isEligibleForHonestOracle ||
                result.isEligibleForMaliciousOracle) &&
              result.parentId;

            if (!includesQuestion) {
              await result.$create("block", { type: "QUESTION" });
            }

            if (!includesAnswer) {
              await result.$create("block", { type: "ANSWER" });
            }

            if (!includesScratchpad) {
              await result.$create("block", { type: "SCRATCHPAD" });
            }

            if (!includesSubquestionDraft) {
              await result.$create("block", { type: "SUBQUESTION_DRAFT" });
            }

            if (!includesAnswerDraft) {
              const curBlocks = (await result.$get("blocks")) as Block[];
              const curAnswer = blocks.find(b => b.type === "ANSWER");
              if (curAnswer) {
                await result.$create("block", {
                  type: "ANSWER_DRAFT",
                  value: curAnswer.value,
                });
              }
            }

            if (
              shouldIncludeOracleAnswerCandidateDraft &&
              !includesOracleAnswerCandidateDraft
            ) {
              await result.$create("block", {
                type: "ORACLE_ANSWER_CANDIDATE",
              });
            }

            return result;
          },
        }),
      },
      users: modelGraphQLFields(new GraphQLList(userType), User),
      user: {
        type: userType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(User),
      },
      assignment: {
        type: assignmentType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(Assignment),
      },
      blocks: modelGraphQLFields(new GraphQLList(blockType), Block),
      snapshots: modelGraphQLFields(new GraphQLList(snapshotType), Snapshot),
      trees: modelGraphQLFields(new GraphQLList(treeType), Tree),
      tree: {
        type: treeType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(Tree),
      },
      experiments: modelGraphQLFields(
        new GraphQLList(experimentType),
        Experiment,
      ),
      experiment: {
        type: experimentType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(Experiment, {
          before: async function(findOptions, args, context, info) {
            if (findOptions.where.id.length < 10) {
              return {
                ...findOptions,
                where: { serialId: Number(findOptions.where.id) },
              };
            }

            return findOptions;
          },
        }),
      },
      snapshot: {
        type: snapshotType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(Snapshot),
      },
      pointers: modelGraphQLFields(new GraphQLList(pointerType), Pointer),
      subtreeTimeSpent: {
        type: GraphQLString, // is JSON stringified
        args: { id: { type: GraphQLString } },
        resolve: async function(obj, { id }) {
          const cacheForTimeSpentOnWorkspace = {};

          const loadDataForEachWorkspaceInSubtree = async workspace => {
            let timespentOnWorkspace = await workspace.budgetUsedWorkingOnThisWorkspace;
            for (const childId of workspace.childWorkspaceOrder) {
              const child = await Workspace.findByPk(childId);
              timespentOnWorkspace += await loadDataForEachWorkspaceInSubtree(
                child,
              );
            }
            cacheForTimeSpentOnWorkspace[workspace.id] = timespentOnWorkspace;
            return timespentOnWorkspace;
          };

          const workspace = await Workspace.findByPkOrSerialId(id);
          await loadDataForEachWorkspaceInSubtree(workspace);

          return JSON.stringify(cacheForTimeSpentOnWorkspace);
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "RootMutationType",
    fields: {
      updateBlocks: {
        type: new GraphQLList(blockType),
        args: {
          blocks: { type: new GraphQLList(BlockInput) },
          experimentId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to update blocks",
          async (_, { blocks, experimentId }, context) => {
            let newBlocks: any = [];
            for (const _block of blocks) {
              const block = await Block.findByPk(_block.id);
              if (block === null) {
                continue;
              }

              const workspace = await Workspace.findByPk(block.workspaceId);

              if (workspace == null) {
                throw new Error(
                  "Got null workspace while attempting to update blocks",
                );
              }

              const user = await userFromContext(context);
              if (user === null) {
                throw new Error("You must be logged in to update blocks");
              }
              const userId = user.id;

              if (!user.isAdmin) {
                if (!experimentId) {
                  throw new Error("User not participating in an experiment.");
                } else {
                  const experiment = await Experiment.findByPkOrSerialId(
                    experimentId,
                  );

                  if (experiment == null) {
                    throw new Error(
                      "Experiment ID refers to non-existant experiment",
                    );
                  }

                  if (!experiment.isActive()) {
                    throw new Error("This experiment is not active.");
                  }

                  const scheduler = await getScheduler(experimentId);

                  if (block.type === "QUESTION") {
                    const idOfCurrentlyActiveUserOfParent = await scheduler.getIdOfCurrentlyActiveUser(
                      workspace.parentId,
                    );
                    if (userId !== idOfCurrentlyActiveUserOfParent) {
                      throw new Error(
                        "User is not currently assigned to this workspace.",
                      );
                    }
                  } else {
                    const idOfCurrentlyActiveUser = await scheduler.getIdOfCurrentlyActiveUser(
                      workspace.id,
                    );
                    if (userId !== idOfCurrentlyActiveUser) {
                      throw new Error(
                        "User is not currently assigned to this workspace.",
                      );
                    }
                  }
                }
              }

              await block.update({ ..._block });
              newBlocks = [...newBlocks, block];
            }
            return newBlocks;
          },
        ),
      },
      createExperiment: {
        type: GraphQLBoolean,
        args: {
          name: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to create an experiment",
          async (_, { name }) => {
            await Experiment.create({ name });
            return true;
          },
        ),
      },
      updateExperimentEligibilityRank: {
        type: GraphQLBoolean,
        args: {
          eligibilityRank: { type: GraphQLInt },
          experimentId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to change an experiment's eligibility",
          async (_, { eligibilityRank, experimentId }) => {
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.update({ eligibilityRank });
            return true;
          },
        ),
      },
      updateExperimentName: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          name: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to change an experiment's name",
          async (_, { experimentId, name }) => {
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.update({ name });
            return true;
          },
        ),
      },
      addTreeToExperiment: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          treeId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to add a tree to an experiment",
          async (_, { experimentId, treeId }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              return false;
            }
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.$add("tree", tree);
            return true;
          },
        ),
      },
      removeTreeFromExperiment: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          treeId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to remove a tree from an experiment",
          async (_, { experimentId, treeId }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              return false;
            }
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.$remove("tree", tree);
            return true;
          },
        ),
      },
      addOracleToTree: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to add an oracle to a tree",
          async (_, { treeId, userId }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              return false;
            }
            const user = await User.findByPk(userId);
            if (user === null) {
              return false;
            }
            await tree.$add("oracle", user);
            return true;
          },
        ),
      },
      updateMaliciousnessOfOracle: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          userId: { type: GraphQLString },
          isMalicious: { type: GraphQLBoolean },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to toggle the maliciousness of an oracle",
          async (_, { treeId, userId, isMalicious }) => {
            const oracleRelation = await UserTreeOracleRelation.findOne({
              where: {
                UserId: userId,
                TreeId: treeId,
              },
            });
            if (oracleRelation === null) {
              return false;
            }
            await oracleRelation.update({ isMalicious });
            return true;
          },
        ),
      },
      removeOracleFromTree: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to remove an oracle from a tree",
          async (_, { treeId, userId }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              return false;
            }
            const user = await User.findByPk(userId);
            if (user === null) {
              return false;
            }
            await tree.$remove("oracle", user);
            return true;
          },
        ),
      },
      addFallbackToExperiment: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          fallbackId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to add a fallback to an experiment",
          async (_, { experimentId, fallbackId }) => {
            const fallback = await Experiment.findByPkOrSerialId(fallbackId);
            if (fallback === null) {
              return false;
            }
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.$add("fallback", fallback);
            return true;
          },
        ),
      },
      removeFallbackFromExperiment: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          fallbackId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to remove a fallback from an experiment",
          async (_, { experimentId, fallbackId }) => {
            const fallback = await Experiment.findByPkOrSerialId(fallbackId);
            if (fallback === null) {
              return false;
            }
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.$remove("fallback", fallback);
            return true;
          },
        ),
      },
      updateTreeDoesAllowOracleBypass: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          doesAllowOracleBypass: { type: GraphQLBoolean },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to toggle tree oracle bypass",
          async (_, { treeId, doesAllowOracleBypass }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              throw new Error("Tree ID does not exist");
            }
            await tree.update({ doesAllowOracleBypass });
            return true;
          },
        ),
      },
      updateTreeIsMIBWithoutRestarts: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          isMIBWithoutRestarts: { type: GraphQLBoolean },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to toggle MIB w/o restarts",
          async (_, { treeId, isMIBWithoutRestarts }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              throw new Error("Tree ID does not exist");
            }
            await tree.update({ isMIBWithoutRestarts });
            return true;
          },
        ),
      },
      updateTreeSchedulingPriority: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          schedulingPriority: { type: GraphQLInt },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to change tree priority",
          async (_, { treeId, schedulingPriority }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              throw new Error("Tree ID does not exist");
            }
            await tree.update({ schedulingPriority });
            return true;
          },
        ),
      },
      updateTreeDepthLimit: {
        type: GraphQLBoolean,
        args: {
          treeId: { type: GraphQLString },
          depthLimit: { type: GraphQLInt },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to change tree priority",
          async (_, { treeId, depthLimit }) => {
            const tree = await Tree.findByPk(treeId);
            if (tree === null) {
              throw new Error("Tree ID does not exist");
            }
            await tree.update({ depthLimit });
            return true;
          },
        ),
      },
      updateWorkspaceChildren: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          childWorkspaceOrder: { type: new GraphQLList(GraphQLString) },
        },
        resolve: requireUser(
          "You must be logged in to update workspace children order",
          async (_, { id, childWorkspaceOrder }) => {
            const workspace = await Workspace.findByPk(id);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ childWorkspaceOrder });
            return workspace;
          },
        ),
      },
      updateWorkspaceIsStaleRelativeToUser: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          isStale: { type: GraphQLBoolean },
        },
        resolve: requireUser(
          "You must be logged in to update workspace children order",
          async (_, { workspaceId, isStale }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            const user = await userFromContext(context);
            if (user === null) {
              throw new Error(
                "You must be logged in to workspace children order",
              );
            }
            const userId = user.id;

            let isNotStaleRelativeToUser = workspace.isNotStaleRelativeToUser;
            if (!isStale && isNotStaleRelativeToUser.indexOf(userId) === -1) {
              isNotStaleRelativeToUser.push(userId);
            }
            if (isStale && isNotStaleRelativeToUser.indexOf(userId) > -1) {
              isNotStaleRelativeToUser = isNotStaleRelativeToUser.filter(
                uId => uId !== userId,
              );
            }

            await workspace.update({ isNotStaleRelativeToUser });
            return workspace;
          },
        ),
      },
      declineToChallenge: {
        type: GraphQLBoolean,
        args: {
          id: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to decline to challenge a workspace",
          async (obj, { id, input }, context) => {
            const workspace = await Workspace.findByPk(id);
            if (workspace === null) {
              return false;
            }

            const parentWorkspace = await Workspace.findByPk(
              workspace.parentId,
            );

            if (parentWorkspace === null) {
              return false;
            }

            const blocks = (await workspace.$get("blocks")) as Block[];
            const question = blocks.find(b => b.type === "QUESTION");

            // make honest oracle response field equal to its answer candidate
            const parentBlocks = (await parentWorkspace.$get(
              "blocks",
            )) as Block[];

            const parentAnswerDraft = parentBlocks.find(
              b => b.type === "ANSWER_DRAFT",
            );

            if (parentAnswerDraft && question) {
              const newAnswerDraftValue = extractHonestAnswerValueFromMaliciousQuestion(
                question.value,
              );

              await parentAnswerDraft.update({
                value: newAnswerDraftValue,
              });
            }

            // mark honest as resolved
            // and check to see if normal parent should be marked as stale
            await parentWorkspace.update({ isCurrentlyResolved: true });
            if (parentWorkspace.parentId) {
              const grandParent = await Workspace.findByPk(
                parentWorkspace.parentId,
              );
              if (grandParent === null) {
                return false;
              }
              const children = (await grandParent.$get(
                "childWorkspaces",
              )) as Workspace[];
              let allResolvedOrArchived = true;
              for (const child of children) {
                if (!(child.isCurrentlyResolved || child.isArchived)) {
                  allResolvedOrArchived = false;
                  break;
                }
              }
              if (allResolvedOrArchived) {
                await grandParent.update({
                  isStale: true,
                  isNotStaleRelativeToUser: [],
                });
              }
            }

            return true;
          },
        ),
      },
      concedeToMalicious: {
        type: GraphQLBoolean,
        args: {
          id: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to decline to challenge a workspace",
          async (obj, { id, input }, context) => {
            const workspace = await Workspace.findByPk(id);
            if (workspace === null) {
              return false;
            }

            await workspace.update({
              isAwaitingHonestExpertDecision: false,
            });

            const parentWorkspace = await Workspace.findByPk(
              workspace.parentId,
            );

            if (parentWorkspace === null) {
              return false;
            }

            const grandParentWorkspace = await Workspace.findByPk(
              parentWorkspace.parentId,
            );

            if (grandParentWorkspace === null) {
              return false;
            }

            const judgeBlocks = (await workspace.$get("blocks")) as Block[];
            const judgeQuestion = judgeBlocks.find(b => b.type === "QUESTION");

            const maliciousBlocks = (await parentWorkspace.$get(
              "blocks",
            )) as Block[];

            const maliciousQuestion = maliciousBlocks.find(
              b => b.type === "QUESTION",
            );

            // make honest response field equal to malicious answer candidate
            const honestBlocks = (await grandParentWorkspace.$get(
              "blocks",
            )) as Block[];

            const grandParentAnswerDraft = honestBlocks.find(
              b => b.type === "ANSWER_DRAFT",
            );

            if (grandParentAnswerDraft && maliciousQuestion && judgeQuestion) {
              const newAnswerDraftValue = extractMaliciousAnswerValueFromMaliciousQuestionAndJudgeQuestion(
                maliciousQuestion.value,
                judgeQuestion.value,
              );

              await grandParentAnswerDraft.update({
                value: newAnswerDraftValue,
              });
            }

            // mark honest as resolved
            // and check to see if upstream judge should be marked as stale
            await grandParentWorkspace.update({ isCurrentlyResolved: true });
            if (grandParentWorkspace.parentId) {
              const upstreamJudge = await Workspace.findByPk(
                grandParentWorkspace.parentId,
              );
              if (upstreamJudge === null) {
                return false;
              }
              const children = (await upstreamJudge.$get(
                "childWorkspaces",
              )) as Workspace[];
              let allResolvedOrArchived = true;
              for (const child of children) {
                if (!child.isCurrentlyResolved && !child.isArchived) {
                  allResolvedOrArchived = false;
                  break;
                }
              }
              if (allResolvedOrArchived) {
                await upstreamJudge.update({
                  isStale: true,
                  isNotStaleRelativeToUser: [],
                });
              }
            }

            return true;
          },
        ),
      },
      playOutSubtree: {
        type: GraphQLBoolean,
        args: {
          id: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to decide to play out a subtree",
          async (obj, { id, input }, context) => {
            const workspace = await Workspace.findByPk(id);
            if (workspace === null) {
              return false;
            }

            await workspace.update({
              isEligibleForHonestOracle: false,
              isAwaitingHonestExpertDecision: false,
            });

            return true;
          },
        ),
      },
      updateWorkspace: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          input: { type: WorkspaceInput },
        },
        resolve: requireUser(
          "You must be logged in to update a workspace",
          async (obj, { id, input }, context) => {
            const workspace = await Workspace.findByPkOrSerialId(id);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }

            const inputWithNoNullOrUndefinedValues = _.omitBy(input, _.isNil);

            const isUserAttemptingToUpdateAtLeastOneField =
              Object.keys(inputWithNoNullOrUndefinedValues).length > 0;

            if (isUserAttemptingToUpdateAtLeastOneField) {
              const {
                isArchived,
                isCurrentlyResolved,
                isEligibleForHonestOracle,
                isEligibleForMaliciousOracle,
                isStale,
                wasAnsweredByOracle,
              } = inputWithNoNullOrUndefinedValues;

              const update = {
                isArchived,
                isEligibleForHonestOracle,
                isEligibleForMaliciousOracle,
                isStale,
                wasAnsweredByOracle,
              };

              const updateWithNoNullOrUndefinedValues = _.omitBy(
                update,
                _.isNil,
              );

              const updatedWorkspace = await workspace.update(
                updateWithNoNullOrUndefinedValues,
              );

              // is isStale updated to true
              // then is stale relative to all users as well
              if (!_.isNil(isStale) && isStale === true) {
                await workspace.update({ isNotStaleRelativeToUser: [] });
              }

              // TODO: A lot of important logic is in the following conditional
              // Would be good to clean it up, DRY it out, etc.
              if (isCurrentlyResolved) {
                // determine isOracleExperiment
                const rootWorkspace = await workspace.getRootWorkspace();
                const tree = (await rootWorkspace.$get("tree")) as Tree;
                const experiments = (await tree.$get(
                  "experiments",
                )) as Experiment[];
                const experiment = experiments[0];
                const isOracleExperiment =
                  experiment && experiment.areNewWorkspacesOracleOnlyByDefault;

                const parent =
                  workspace.parentId &&
                  (await Workspace.findByPk(workspace.parentId));
                const isNormalWithNormalParent =
                  !workspace.isEligibleForHonestOracle &&
                  !workspace.isEligibleForMaliciousOracle &&
                  parent &&
                  !parent.isEligibleForHonestOracle &&
                  !parent.isEligibleForMaliciousOracle;

                const isMIBWithoutRestarts = tree.isMIBWithoutRestarts;

                if (
                  !isOracleExperiment ||
                  workspace.isRequestingLazyUnlock ||
                  isNormalWithNormalParent
                ) {
                  const updatedWorkspace = await workspace.update({
                    isCurrentlyResolved,
                  });

                  // if is currently resolved updated to true
                  // and workspace has parent, then
                  // if parent workspace has all children resolved
                  // then mark parent workspace as not stale
                  if (updatedWorkspace.parentId) {
                    const parent = await Workspace.findByPk(
                      updatedWorkspace.parentId,
                    );
                    if (parent === null) {
                      throw new Error("Parent ID does not exist");
                    }
                    const children = (await parent.$get(
                      "childWorkspaces",
                    )) as Workspace[];
                    let allResolvedOrArchived = true;
                    for (const child of children) {
                      if (!(child.isCurrentlyResolved || child.isArchived)) {
                        allResolvedOrArchived = false;
                        break;
                      }
                    }
                    if (allResolvedOrArchived) {
                      await parent.update({
                        isStale: true,
                        isNotStaleRelativeToUser: [],
                      });
                    }
                  }
                } else {
                  if (
                    !workspace.isEligibleForHonestOracle &&
                    !workspace.isEligibleForMaliciousOracle &&
                    workspace.parentId
                  ) {
                    const parentWorkspace = await Workspace.findByPk(
                      workspace.parentId,
                    );
                    if (parentWorkspace === null) {
                      throw new Error("Parent ID does not exist");
                    }

                    if (parentWorkspace.parentId) {
                      const grandparentWorkspace = await Workspace.findByPk(
                        parentWorkspace.parentId,
                      );
                      if (grandparentWorkspace === null) {
                        throw new Error(
                          "Grandparent does not exist (but should)",
                        );
                      }

                      // Make honest ancestor resolved
                      await grandparentWorkspace.update({
                        isCurrentlyResolved,
                      });

                      // If not "most interesting branch" w/o restarts
                      if (!isMIBWithoutRestarts) {
                        // If honest ancestor has judge parent
                        if (grandparentWorkspace.parentId) {
                          // Then see if judge parent has all subquestions resolved
                          // And should therefore should be marked stale (i.e., eligible for scheduling)
                          const greatGrandparentWorkspace = await Workspace.findByPk(
                            grandparentWorkspace.parentId,
                          );
                          if (greatGrandparentWorkspace === null) {
                            throw new Error(
                              "Great-grandparent does not exist (but should)",
                            );
                          }
                          const isRoot = _.isNil(
                            greatGrandparentWorkspace.parentId,
                          );

                          if (!isRoot) {
                            const children = (await greatGrandparentWorkspace.$get(
                              "childWorkspaces",
                            )) as Workspace[];

                            let allResolvedOrArchived = true;

                            for (const child of children) {
                              if (
                                !(child.isCurrentlyResolved || child.isArchived)
                              ) {
                                allResolvedOrArchived = false;
                                break;
                              }
                            }

                            if (allResolvedOrArchived) {
                              await greatGrandparentWorkspace.update({
                                isStale: true,
                                isNotStaleRelativeToUser: [],
                              });
                            }
                          }
                        }
                      }
                    }
                  }

                  if (workspace.isEligibleForHonestOracle) {
                    setTimeout(async () => {
                      const blocks = (await workspace.$get(
                        "blocks",
                      )) as Block[];

                      const oracleAnswerCandidate = blocks.find(
                        b => b.type === "ORACLE_ANSWER_CANDIDATE",
                      );

                      const question = blocks.find(b => b.type === "QUESTION");

                      // create malicious child
                      await workspace.createChild({
                        question: generateMaliciousQuestionValue(
                          _.get(question, "value"),
                          _.get(oracleAnswerCandidate, "value"),
                        ),
                        totalBudget: 0,
                        creatorId: context.user.id,
                        isPublic: false,
                        shouldOverrideToNormalUser: false,
                      });
                    }, 20000);
                  }

                  if (workspace.isEligibleForMaliciousOracle) {
                    setTimeout(async () => {
                      const blocks = (await workspace.$get(
                        "blocks",
                      )) as Block[];

                      const oracleAnswerCandidate = blocks.find(
                        b => b.type === "ORACLE_ANSWER_CANDIDATE",
                      );

                      const question = blocks.find(b => b.type === "QUESTION");

                      const childQuestionValue = generateJudgeQuestionValue(
                        _.get(question, "value"),
                        _.get(oracleAnswerCandidate, "value"),
                      );

                      // create judge child
                      await workspace.createChild({
                        question: childQuestionValue,
                        totalBudget: 0,
                        creatorId: context.user.id,
                        isPublic: false,
                        shouldOverrideToNormalUser: false,
                      });
                    }, 20000);
                  }
                }

                // if in oracle workspace and typical user, propagate isCurrentlyResolved up through oracles
              }

              return updatedWorkspace;
            }

            return workspace;
          },
        ),
      },
      updateWorkspaceWasAnsweredByOracle: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          wasAnsweredByOracle: { type: GraphQLBoolean },
        },
        resolve: async (_, { id, wasAnsweredByOracle }) => {
          const workspace = await Workspace.findByPk(id);
          if (workspace === null) {
            throw new Error("Workspace ID does not exist");
          }
          await workspace.update({ wasAnsweredByOracle });
          return workspace;
        },
      },
      transferRemainingBudgetToParent: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to transfer remaining budget to parent",
          async (_, { id }) => {
            const child = await Workspace.findByPk(id);
            if (child === null) {
              throw new Error("Child ID does not exist");
            }
            const childRemainingBudget =
              child.totalBudget - child.allocatedBudget;
            const parent = await Workspace.findByPk(child.parentId);
            if (parent === null) {
              throw new Error("Parent ID does not exist");
            }
            await parent.update({
              allocatedBudget: parent.allocatedBudget - childRemainingBudget,
            });
            await child.update({ totalBudget: child.allocatedBudget });
          },
        ),
      },
      depleteBudget: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_, { id }) => {
          const workspace = await Workspace.findByPk(id);
          if (workspace === null) {
            throw new Error("Workspace ID does not exist");
          }
          await workspace.update({ allocatedBudget: workspace.totalBudget });
          return workspace;
        },
      },
      createWorkspace: {
        type: workspaceType,
        args: {
          question: { type: GraphQLJSON },
          totalBudget: { type: GraphQLInt },
          experimentId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to create a workspace",
          async (_, { question, totalBudget, experimentId }, context) => {
            const user = await userFromContext(context);
            if (user === null) {
              throw new Error("You must be logged in to create a workspace");
            }

            let workspace;

            if (experimentId) {
              const experiment = await Experiment.findByPkOrSerialId(
                experimentId,
              );
              if (experiment === null) {
                throw new Error("Experiment ID does not exist");
              }

              workspace = await Workspace.create(
                {
                  totalBudget,
                  creatorId: user.id,
                  isEligibleForMaliciousOracle:
                    experiment.areNewWorkspacesOracleOnlyByDefault,
                },
                { questionValue: JSON.parse(question) },
              );

              const tree = await Tree.create({
                rootWorkspaceId: workspace.id,
              });

              await experiment.$add("tree", tree);
            } else {
              workspace = await Workspace.create(
                {
                  totalBudget,
                  creatorId: user.id,
                },
                { questionValue: JSON.parse(question) },
              );
            }

            return workspace;
          },
        ),
      },
      createChildWorkspace: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          question: { type: GraphQLJSON },
          shouldOverrideToNormalUser: { type: GraphQLBoolean },
          totalBudget: { type: GraphQLInt },
        },
        resolve: requireUser(
          "You must be logged in to create a subquestion",
          async (
            _,
            { workspaceId, question, shouldOverrideToNormalUser, totalBudget },
            context,
          ) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            const user = await userFromContext(context);
            if (user === null) {
              throw new Error("You must be logged in to create a subquestion");
            }

            return await workspace.createChild({
              question: JSON.parse(question),
              totalBudget,
              creatorId: user.id,
              isPublic: isUserAdmin(user),
              shouldOverrideToNormalUser,
            });
          },
        ),
      },
      updateChildTotalBudget: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          childId: { type: GraphQLString },
          totalBudget: { type: GraphQLInt },
        },
        resolve: requireUser(
          "You must be logged in to update a child's total budget",
          async (_, { workspaceId, childId, totalBudget }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            const child = await Workspace.findByPk(childId);
            await workspace.changeAllocationToChild(child, totalBudget);
          },
        ),
      },
      findNextWorkspace: {
        type: workspaceType,
        args: {
          experimentId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId }, context) => {
          const user = await userFromContext(context);
          if (user == null) {
            throw new Error(
              "No user found when attempting get next workspace.",
            );
          }

          if (experimentId.length < 10) {
            const experiment = await Experiment.findOne({
              where: {
                serialId: Number(experimentId),
              },
            });

            experimentId = experiment.id;
          }

          const scheduler = await getScheduler(experimentId);

          const workspaceId = await scheduler.assignNextWorkspace(user.id);

          const workspace = await Workspace.findByPk(workspaceId);

          return workspace;
        },
      },
      notifyOnNextWorkspace: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId }, context) => {
          const user = await userFromContext(context);
          if (user == null) {
            throw new Error(
              "No user found when attempting to register for notifications.",
            );
          }

          if (experimentId.length < 10) {
            const experiment = await Experiment.findOne({
              where: {
                serialId: Number(experimentId),
              },
            });

            experimentId = experiment.id;
          }

          return await NotificationRequest.upsert({
            experimentId,
            userId: user.id,
          });
        },
      },
      findNextMaybeSuboptimalWorkspace: {
        type: workspaceType,
        args: {
          experimentId: { type: GraphQLString },
        },
        resolve: async (_, { experimentId }, context) => {
          const user = await userFromContext(context);
          if (user == null) {
            throw new Error(
              "No user found when attempting get next workspace.",
            );
          }

          if (experimentId.length < 10) {
            const experiment = await Experiment.findOne({
              where: {
                serialId: Number(experimentId),
              },
            });

            experimentId = experiment.id;
          }

          const scheduler = await getScheduler(experimentId);

          const workspaceId = await scheduler.assignNextMaybeSuboptimalWorkspace(
            user.id,
          );

          const workspace = await Workspace.findByPk(workspaceId);

          return workspace;
        },
      },
      leaveCurrentWorkspace: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to leave a workspace",
          async (_, { experimentId }, context) => {
            const user = await userFromContext(context);
            if (user === null) {
              return false;
            }

            if (experimentId.length < 10) {
              const experiment = await Experiment.findOne({
                where: {
                  serialId: Number(experimentId),
                },
              });

              experimentId = experiment.id;
            }

            const scheduler = await getScheduler(experimentId);
            await scheduler.leaveCurrentWorkspace(user.id);
            return true;
          },
        ),
      },
      ejectUserFromCurrentWorkspace: {
        type: GraphQLBoolean,
        args: {
          userId: { type: GraphQLString },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to eject a user from a workspace",
          async (_, { userId, workspaceId }, context) => {
            let curWorkspace = await Workspace.findByPk(workspaceId);
            if (curWorkspace === null) {
              return false;
            }
            while (curWorkspace.parentId) {
              curWorkspace = await Workspace.findByPk(curWorkspace.parentId);
              if (curWorkspace === null) {
                return false;
              }
            }

            const rootWorkspace = curWorkspace;

            const tree = (await rootWorkspace.$get("tree")) as Tree;

            const experiments = (await tree.$get(
              "experiments",
            )) as Experiment[];
            const experiment = experiments[0];
            const experimentId = experiment.id;

            const scheduler = await getScheduler(experimentId);

            // have this guard here in case user has already left this particular workspace
            // and is working on a different one
            if (
              scheduler.isUserCurrentlyWorkingOnWorkspace(userId, workspaceId)
            ) {
              await scheduler.leaveCurrentWorkspace(userId);
            }

            return true;
          },
        ),
      },
      updateWorkspaceIsPublic: {
        type: workspaceType,
        args: {
          isPublic: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to edit a workspace's front page status",
          async (_, { isPublic, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ isPublic });
            return workspace;
          },
        ),
      },
      updateWorkspaceIsEligible: {
        type: workspaceType,
        args: {
          isEligibleForAssignment: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to update a workspace's eligibility",
          async (_, { isEligibleForAssignment, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ isEligibleForAssignment });
            return workspace;
          },
        ),
      },
      updateWorkspaceHasTimeBudget: {
        type: workspaceType,
        args: {
          hasTimeBudget: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to edit a workspace's time budget status",
          async (_, { hasTimeBudget, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ hasTimeBudget });
            return workspace;
          },
        ),
      },
      updateWorkspaceHasIOConstraints: {
        type: workspaceType,
        args: {
          hasIOConstraints: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to edit a workspace's i/o constraint status",
          async (_, { hasIOConstraints, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ hasIOConstraints });
            return workspace;
          },
        ),
      },
      updateWorkspaceIsEligibleForOracle: {
        type: workspaceType,
        args: {
          isEligibleForHonestOracle: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to update a workspace's oracle eligibility",
          async (_, { isEligibleForHonestOracle, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            await workspace.update({ isEligibleForHonestOracle });
            return workspace;
          },
        ),
      },
      updateAllocatedBudget: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          changeToBudget: { type: GraphQLInt },
        },
        resolve: requireUser(
          "You must be logged in to update a workspace's allocated budget",
          async (_, { workspaceId, changeToBudget }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              throw new Error("Workspace ID does not exist");
            }
            const updatedTimeBudget = Math.min(
              workspace.totalBudget,
              workspace.allocatedBudget + changeToBudget,
            );
            await workspace.update({ allocatedBudget: updatedTimeBudget });
            return workspace;
          },
        ),
      },
      updateTimeSpentOnWorkspace: {
        type: GraphQLBoolean,
        args: {
          doesAffectAllocatedBudget: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
          secondsSpent: { type: GraphQLInt },
        },
        resolve: requireUser(
          "You must be logged in to update the time spent on a workspace",
          async (
            _,
            { doesAffectAllocatedBudget, workspaceId, secondsSpent },
            context,
          ) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              return false;
            }

            if (doesAffectAllocatedBudget) {
              const updatedTimeBudget = Math.min(
                workspace.totalBudget,
                workspace.allocatedBudget + secondsSpent,
              );

              await workspace.update({
                allocatedBudget: updatedTimeBudget,
                timeSpentOnThisWorkspace:
                  workspace.timeSpentOnThisWorkspace + secondsSpent,
              });
            } else {
              await workspace.update({
                timeSpentOnThisWorkspace:
                  workspace.timeSpentOnThisWorkspace + secondsSpent,
              });
            }

            return true;
          },
        ),
      },
      updateExperimentMetadata: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          metadata: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to update experiment metadata",
          async (_, { experimentId, metadata }, context) => {
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.update({ metadata: JSON.parse(metadata) });
            return true;
          },
        ),
      },
      updateExperimentInstructions: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          instructions: { type: GraphQLString },
          type: { type: instructionsEnumType },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to update experiment instructions",
          async (_, { experimentId, instructions, type }, context) => {
            const [instruction, created] = await Instructions.findOrBuild({
              where: { experimentId, type },
            });
            instruction.value = instructions;
            await instruction.save();
            return true;
          },
        ),
      },
      updateExperimentDefaultOracle: {
        type: GraphQLBoolean,
        args: {
          experimentId: { type: GraphQLString },
          defaultOracle: { type: GraphQLBoolean },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to update experiment metadata",
          async (_, { experimentId, defaultOracle }, context) => {
            const experiment = await Experiment.findByPkOrSerialId(
              experimentId,
            );
            if (experiment === null) {
              return false;
            }
            await experiment.update({
              areNewWorkspacesOracleOnlyByDefault: defaultOracle,
            });
            return true;
          },
        ),
      },
      markWorkspaceStaleForUser: {
        type: GraphQLBoolean,
        args: {
          userId: { type: GraphQLString },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to mark a workspace stale for a user",
          async (_, { userId, workspaceId }, context) => {
            const workspace = await Workspace.findByPk(workspaceId);
            if (workspace === null) {
              return false;
            }

            const isNotStaleRelativeToUser = workspace.isNotStaleRelativeToUser.filter(
              uId => uId !== userId,
            );

            await workspace.update({ isNotStaleRelativeToUser });

            return true;
          },
        ),
      },
      unlockPointer: {
        type: GraphQLBoolean,
        args: {
          pointerId: { type: GraphQLString },
          workspaceId: { type: GraphQLString },
        },
        resolve: requireUser(
          "You must be logged in to unlock a pointer",
          async (_, { pointerId, workspaceId }, context) => {
            const exportWorkspaceLockRelation = await ExportWorkspaceLockRelation.findOne(
              {
                where: {
                  pointerId,
                  workspaceId,
                },
              },
            );

            if (exportWorkspaceLockRelation) {
              await exportWorkspaceLockRelation.update({ isLocked: false });
            } else {
              await ExportWorkspaceLockRelation.create({
                isLocked: false,
                pointerId,
                workspaceId,
              });
            }

            return true;
          },
        ), // unlock pointer resolver
      }, // unlockPointer mutation
      bulkCreateExperiments: {
        type: new GraphQLList(experimentType),
        args: {
          bulkExperimentInputs: { type: new GraphQLList(ExperimentInput) },
        },
        resolve: requireAdmin(
          "You must be logged in as an admin to bulk-create experiments",
          async (__, args, context) => {
            const user = await userFromContext(context);
            const newExperiments: Experiment[] = [];
            const experimentInputs = args.bulkExperimentInputs;

            const contentToSlateNodes = content => [
              {
                object: "block",
                type: "line",
                isVoid: false,
                data: {},
                nodes: [
                  {
                    object: "text",
                    leaves: [
                      {
                        object: "leaf",
                        text: content,
                      },
                    ],
                  },
                ],
              },
            ];

            for (const experimentInput of experimentInputs) {
              const {
                experimentName = "Experiment",
                experimentId,
                trees,
              } = experimentInput;

              let experiment;
              if (experimentId) {
                experiment = await Experiment.findByPkOrSerialId(experimentId);

                if (!experiment) {
                  continue; // if id doesn't match experiment, proceed to next experiment
                }
              } else {
                experiment = await Experiment.create({
                  name: experimentName,
                });
              }

              newExperiments.push(experiment);

              for (const treeInfo of trees) {
                const {
                  rootLevelQuestion = "root-level q",
                  rootLevelScratchpad = "root-level scratchpad",
                  honestAnswer,
                  maliciousAnswer,
                  emailsOfHonestOracles = [],
                  emailsOfMaliciousOracles = [],
                  doesAllowJudgeToJudge = false,
                  isMIBWithoutRestarts = false,
                  schedulingPriority = 1,
                  depthLimit = 6,
                } = treeInfo;

                const workspace = await Workspace.create(
                  {
                    totalBudget: 0,
                    creatorId: user.id,
                    isEligibleForMaliciousOracle: true,
                  },
                  {
                    questionValue: addExportsAndLinks(
                      contentToSlateNodes(rootLevelQuestion),
                    ),
                  },
                );

                // Honest child workspace is always created, so top-level question is never stale.
                await workspace.update({
                  isStale: false,
                });

                const tree = await Tree.create({
                  rootWorkspaceId: workspace.id,
                  doesAllowOracleBypass: doesAllowJudgeToJudge,
                  isMIBWithoutRestarts,
                  schedulingPriority,
                  depthLimit,
                });

                await experiment.$add("tree", tree);

                const blocks = await workspace.$get("blocks");

                const scratchpad = blocks.find(b => b.type === "SCRATCHPAD");

                await scratchpad.update({
                  value: addExportsAndLinks(
                    contentToSlateNodes(rootLevelScratchpad),
                  ),
                });

                const honestChild = await workspace.createChild({
                  question: addExportsAndLinks(
                    contentToSlateNodes(rootLevelQuestion),
                  ),
                  totalBudget: 0,
                  creatorId: user.id,
                  isPublic: false,
                  shouldOverrideToNormalUser: false,
                });

                await honestChild.update({
                  isStale: honestAnswer ? false : true,
                });

                if (honestAnswer) {
                  const blocks = (await honestChild.$get("blocks")) as Block[];
                  const honestAnswerCandidate = blocks.find(
                    b => b.type === "ORACLE_ANSWER_CANDIDATE",
                  );

                  honestAnswerCandidate &&
                    (await honestAnswerCandidate.update({
                      value: addExportsAndLinks(
                        contentToSlateNodes(honestAnswer),
                      ),
                    }));

                  const question = blocks.find(b => b.type === "QUESTION");

                  // create malicious child
                  const maliciousChild = await honestChild.createChild({
                    question: generateMaliciousQuestionValue(
                      _.get(question, "value"),
                      _.get(honestAnswerCandidate, "value"),
                    ),
                    totalBudget: 0,
                    creatorId: user.id,
                    isPublic: false,
                    shouldOverrideToNormalUser: false,
                  });

                  await maliciousChild.update({
                    isStale: maliciousAnswer ? false : true,
                  });

                  if (maliciousAnswer) {
                    const blocks = (await maliciousChild.$get(
                      "blocks",
                    )) as Block[];

                    const maliciousAnswerCandidate = blocks.find(
                      b => b.type === "ORACLE_ANSWER_CANDIDATE",
                    );

                    maliciousAnswerCandidate &&
                      (await maliciousAnswerCandidate.update({
                        value: addExportsAndLinks(
                          contentToSlateNodes(maliciousAnswer),
                        ),
                      }));

                    const question = blocks.find(b => b.type === "QUESTION");

                    // create judge workspace
                    await maliciousChild.createChild({
                      question: generateJudgeQuestionValue(
                        _.get(question, "value"),
                        _.get(maliciousAnswerCandidate, "value"),
                      ),
                      totalBudget: 0,
                      creatorId: user.id,
                      isPublic: false,
                      shouldOverrideToNormalUser: false,
                    });
                  }
                }

                for (const emailOfHonestOracle of emailsOfHonestOracles) {
                  const user = await User.findOne({
                    where: {
                      email: emailOfHonestOracle.toLowerCase(),
                    },
                  });

                  if (!user) {
                    throw new Error(
                      `No user with email address ${emailOfHonestOracle.toLowerCase()}`,
                    );
                  }

                  await tree.$add("oracle", user);
                }

                for (const emailOfMaliciousOracle of emailsOfMaliciousOracles) {
                  const user = await User.findOne({
                    where: {
                      email: emailOfMaliciousOracle.toLowerCase(),
                    },
                  });

                  if (!user) {
                    throw new Error(
                      `No user with email address ${emailOfMaliciousOracle.toLowerCase()}`,
                    );
                  }

                  await tree.$add("oracle", user);

                  const oracleRelation = await UserTreeOracleRelation.findOne({
                    where: {
                      UserId: user.id,
                      TreeId: tree.id,
                    },
                  });

                  if (oracleRelation === null) {
                    return false;
                  }

                  await oracleRelation.update({ isMalicious: true });
                }
              }
            }
            return newExperiments;
          },
        ),
      },
      selectAnswerCandidate: {
        type: GraphQLBoolean,
        args: {
          id: { type: GraphQLString },
          decision: { type: GraphQLInt },
        },
        resolve: requireUser(
          "You must be logged in to select an answer candidate",
          async (_, { id, decision }, context) => {
            const workspace = await Workspace.findByPk(id);
            if (workspace === null) {
              return false;
            }

            // extract content from workspace question
            const blocks = (await workspace.$get("blocks")) as Block[];
            const questionBlock = blocks.find(b => b.type === "QUESTION");
            if (questionBlock) {
              const answerValue = extractAnswerValueFromQuestion(
                questionBlock.value,
                decision,
              );

              // populate workspace answer draft with content
              const answerDraftBlock = blocks.find(
                b => b.type === "ANSWER_DRAFT",
              );
              if (answerDraftBlock) {
                await answerDraftBlock.update({
                  value: answerValue,
                });
              }
            }

            return false;
          },
        ), // unlock pointer resolver
      }, // unlockPointer mutation
      createSnapshot: {
        type: GraphQLBoolean,
        args: {
          userId: { type: GraphQLString },
          workspaceId: { type: GraphQLString },
          assignmentId: { type: GraphQLString },
          actionType: { type: GraphQLString },
          snapshot: { type: GraphQLString },
        },
        resolve: async (
          _,
          { userId, workspaceId, assignmentId, actionType, snapshot },
          ctx,
        ) => {
          const snapshots = await Snapshot.findAll({
            where: {
              assignmentId,
            },
          });

          if (snapshots.length === 0 && actionType === "UNLOAD") {
            return true;
          }

          if (snapshots.filter(s => s.actionType === actionType).length !== 0) {
            const snapshotToUpdate = snapshots.find(
              s => s.actionType === actionType,
            );

            if (snapshotToUpdate.actionType === "INITIALIZE") {
              return;
            }

            await snapshotToUpdate.update({
              userId,
              workspaceId,
              assignmentId,
              actionType,
              snapshot: JSON.parse(snapshot),
            });

            return true;
          }

          await Snapshot.create({
            userId,
            workspaceId,
            assignmentId,
            actionType,
            snapshot: JSON.parse(snapshot),
          });

          return true;
        },
      },
    }, // mutation fields
  }), // mutation: new GraphQLObjectType({...})
}); // const schema = new GraphQLSchema({...})

export { schema };
