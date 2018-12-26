import * as models from "../models";
import { isInOracleMode } from "../globals/isInOracleMode";
import * as _ from "lodash";
import { resolver, attributeFields } from "graphql-sequelize";
import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLList,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLInputObjectType
} from "graphql";
import * as GraphQLJSON from "graphql-type-json";
import * as auth0 from "auth0-js";
import * as Sequelize from "sequelize";
import { scheduler } from "../scheduler";

const { auth0_client_id } = require(__dirname + "/../../config/config.json");

const webAuth = new auth0.WebAuth({
  domain: "mosaicapp.auth0.com",
  clientID: auth0_client_id,
  scope: "openid user_metadata app_metadata"
});

const generateReferences = (model, references) => {
  const all = {};
  references.map(r => {
    all[r[0]] = {
      type: r[1](),
      resolve: resolver(model[r[2]])
    };
  });
  return all;
};

const makeObjectType = (model, references, extraFields = {}) =>
  new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () =>
      _.assign(
        attributeFields(model),
        generateReferences(model, references),
        extraFields
      )
  });

const standardReferences = [
  ["createdAtEvent", () => eventType, "CreatedAtEvent"],
  ["updatedAtEvent", () => eventType, "UpdatedAtEvent"]
];

const blockType = makeObjectType(models.Block, [
  ...standardReferences,
  ["workspace", () => workspaceType, "Workspace"]
]);

const workspaceType = makeObjectType(models.Workspace, [
  ...standardReferences,
  ["childWorkspaces", () => new GraphQLList(workspaceType), "ChildWorkspaces"],
  ["parentWorkspace", () => new GraphQLList(workspaceType), "ParentWorkspace"],
  ["blocks", () => new GraphQLList(blockType), "Blocks"],
  ["pointerImports", () => new GraphQLList(pointerImportType), "PointerImports"]
]);

const eventType = makeObjectType(models.Event, []);

const pointerType = makeObjectType(models.Pointer, [
  ...standardReferences,
  ["pointerImport", () => pointerImportType, "PointerImport"],
  ["sourceBlock", () => blockType, "SourceBlock"]
]);

const pointerImportType = makeObjectType(models.PointerImport, [
  ...standardReferences,
  ["workspace", () => blockType, "Workspace"],
  ["pointer", () => pointerType, "Pointer"]
]);

const oracleModeType = new GraphQLObjectType({
  name: "OracleMode",
  fields: {
    value: { type: GraphQLBoolean },
  }
});

const BlockInput = new GraphQLInputObjectType({
  name: "blockInput",
  fields: _.pick(attributeFields(models.Block), "value", "id")
});

const WorkspaceInput = new GraphQLInputObjectType({
  name: "WorkspaceInput",
  fields: _.pick(attributeFields(models.Workspace), "isStale")
});

function modelGraphQLFields(type: any, model: any) {
  return {
    type,
    args: { where: { type: GraphQLJSON } },
    resolve: resolver(model)
  };
}

function userFromAuthToken(accessToken: string | null): Promise<any | null> {
  if (accessToken == null || accessToken === "null") {
    return Promise.resolve(null);
  }

  // first check cache and return cached value if it's younger than 10 seconds
  const cachedToken = userFromAuthToken.cache[accessToken];
  if (cachedToken) {
    const nowTimestamp = Date.now();
    const cacheTimestamp = cachedToken.timestamp;
    const TEN_SECONDS = 10000;
    if (nowTimestamp - cacheTimestamp < TEN_SECONDS) {
      return Promise.resolve(cachedToken.data);
    }
  }

  return new Promise(resolve => {
    webAuth.client.userInfo(accessToken, function(err: any, user: any) {
      if (err != null) {
        console.log("UserInfo error:", err);
        return resolve(null);
      }
      const metadataKey = "https://mosaic:auth0:com/app_metadata";
      const isAdmin = user[metadataKey] ? user[metadataKey].is_admin : false;
      const isOracle = user[metadataKey] ? user[metadataKey].is_oracle : false;

      const data = {
        user_id: user.sub,
        is_admin: isAdmin,
        is_oracle: isOracle,
       };

      // update cache
      userFromAuthToken.cache[accessToken] = {
        data,
        timestamp: Date.now()
      };

      return resolve(data);
    });
  });
}

userFromAuthToken.cache = {};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      oracleMode: {
        type: GraphQLBoolean,
        resolve: function () {
          return isInOracleMode.getValue();
        },
      },
      workspaces: {
        type: new GraphQLList(workspaceType),
        args: { where: { type: GraphQLJSON } },
        resolve: resolver(models.Workspace, {
          before: async function(findOptions, args, context, info) {
            const user = await userFromAuthToken(context.authorization);
            if (user == null) {
              findOptions.where = {
                isPublic: true,
                ...findOptions.where
              };
            } else if (!user.is_admin) {
              findOptions.where = {
                [Sequelize.Op.or]: [
                  { creatorId: user.user_id },
                  { isPublic: true }
                ],
                ...findOptions.where
              };
            }
            return findOptions;
          }
        })
      },
      workspace: {
        type: workspaceType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(models.Workspace, {
          after: async (result, args, ctx) => {
            // On Thursday, Nov 1 2018, a workspace failed to load on the
            // frontend. When looking into this, it was clear that this
            // workspace only had a QUESTION block on the backend, and no
            // ANSWER or SCRATCHPAD block and that this was the reason for the
            // error on the frontend.

            // Unclear how this could have occurred. But in order to prevent it
            // in the future, I added this graphql-sequelize "after" hook to
            // ensure the existence of the three required blocks.

            const blocks = await result.getBlocks();

            const includesQuestion = blocks.find(b => b.type === "QUESTION");
            const includesAnswer = blocks.find(b => b.type === "ANSWER");
            const includesScratchpad = blocks.find(
              b => b.type === "SCRATCHPAD"
            );
            const includesSubquestionDraft = blocks.find(
              b => b.type === "SUBQUESTION_DRAFT"
            );

            if (!includesQuestion) {
              await result.createBlock({ type: "QUESTION" });
            }

            if (!includesAnswer) {
              await result.createBlock({ type: "ANSWER" });
            }

            if (!includesScratchpad) {
              await result.createBlock({ type: "SCRATCHPAD" });
            }

            if (!includesSubquestionDraft) {
              await result.createBlock({ type: "SUBQUESTION_DRAFT" });
            }

            return result;
          }
        })
      },
      blocks: modelGraphQLFields(new GraphQLList(blockType), models.Block),
      pointers: modelGraphQLFields(
        new GraphQLList(pointerType),
        models.Pointer
      ),
      events: modelGraphQLFields(new GraphQLList(eventType), models.Event),
      subtreeTimeSpent: {
        type: GraphQLString, // is JSON stringified
        args: { id: { type: GraphQLString } },
        resolve: async function(obj, { id }) {
          const cacheForTimeSpentOnWorkspace = {};

          const loadDataForEachWorkspaceInSubtree = async workspace => {
            let timespentOnWorkspace = await workspace.budgetUsedWorkingOnThisWorkspace;
            for (const childId of workspace.childWorkspaceOrder) {
              const child = await models.Workspace.findById(childId);
              timespentOnWorkspace += await loadDataForEachWorkspaceInSubtree(child);
            }
            cacheForTimeSpentOnWorkspace[workspace.id] = timespentOnWorkspace
            return timespentOnWorkspace;
          }

          const workspace = await models.Workspace.findById(id);
          await loadDataForEachWorkspaceInSubtree(workspace);

          return JSON.stringify(cacheForTimeSpentOnWorkspace);
        },
      },
    }
  }),
  mutation: new GraphQLObjectType({
    name: "RootMutationType",
    fields: {
      updateOracleMode: {
        type: GraphQLBoolean,
        args: { oracleMode: { type: GraphQLBoolean } },
        resolve: function (_, { oracleMode }) {
          isInOracleMode.setValue(oracleMode);
        },
      },
      updateBlocks: {
        type: new GraphQLList(blockType),
        args: { blocks: { type: new GraphQLList(BlockInput) } },
        resolve: async (_, { blocks }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error("Got null user while attempting to update blocks");
          }

          const event = await models.Event.create();
          let newBlocks: any = [];
          for (const _block of blocks) {
            const block = await models.Block.findById(_block.id);

            const workspace = await models.Workspace.findById(
              block.workspaceId
            );
            if (workspace == null) {
              throw new Error(
                "Got null workspace while attempting to update blocks"
              );
            }
            await block.update({ ..._block }, { event });
            newBlocks = [...newBlocks, block];
          }
          return newBlocks;
        }
      },
      updateWorkspaceChildren: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          childWorkspaceOrder: { type: new GraphQLList(GraphQLString) }
        },
        resolve: async (_, { id, childWorkspaceOrder }) => {
          const workspace = await models.Workspace.findById(id);
          const event = await models.Event.create();
          return workspace.update({ childWorkspaceOrder }, { event });
        }
      },
      updateWorkspace: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          input: { type: WorkspaceInput }
        },
        resolve: async (_, { id, input }) => {
          if (user == null) {
            throw new Error("Got null user while attempting to update workspace");
          }
          const workspace = await models.Workspace.findById(id);
          const { isStale } = input;
          if (isStale) {
            return workspace.update({ isStale });
          }
        }
      },
      updateWorkspaceIsArchived: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          isArchived: { type: GraphQLBoolean }
        },
        resolve: async (_, { id, isArchived }) => {
          const workspace = await models.Workspace.findById(id);
          const event = await models.Event.create();
          return workspace.update({ isArchived }, { event });
        }
      },
      updateWorkspaceWasAnsweredByOracle: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          wasAnsweredByOracle: { type: GraphQLBoolean }
        },
        resolve: async (_, { id, wasAnsweredByOracle }) => {
          const workspace = await models.Workspace.findById(id);
          const event = await models.Event.create();
          return workspace.update({ wasAnsweredByOracle }, { event });
        }
      },
      transferRemainingBudgetToParent: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString }
        },
        resolve: async (_, { id }) => {
          const child = await models.Workspace.findById(id);
          const childRemainingBudget =
            child.totalBudget - child.allocatedBudget;
          const parent = await models.Workspace.findById(child.parentId);
          await parent.update({
            isStale: true,
            allocatedBudget: parent.allocatedBudget - childRemainingBudget,
          });
          await child.update({ totalBudget: child.allocatedBudget });
        }
      },
      depleteBudget: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString }
        },
        resolve: async (_, { id }) => {
          const workspace = await models.Workspace.findById(id);
          await workspace.update({ allocatedBudget: workspace.totalBudget });
        }
      },
      createWorkspace: {
        type: workspaceType,
        args: {
          question: { type: GraphQLJSON },
          totalBudget: { type: GraphQLInt }
        },
        resolve: async (_, { question, totalBudget }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to create workspace."
            );
          }
          const event = await models.Event.create();

          // TODO: Replace with an argument that allows an admin to set private/public
          const isPublic = user.is_admin;

          const workspace = await models.Workspace.create(
            { totalBudget, creatorId: user.user_id, isPublic },
            { event, questionValue: JSON.parse(question) }
          );
          return workspace;
        }
      },
      createChildWorkspace: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          question: { type: GraphQLJSON },
          totalBudget: { type: GraphQLInt }
        },
        resolve: async (_, { workspaceId, question, totalBudget }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to create child workspace."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          const event = await models.Event.create();
          const child = await workspace.createChild({
            event,
            question: JSON.parse(question),
            totalBudget,
            creatorId: user.user_id,
            isPublic: user.is_admin
          });
          await workspace.update({ isEligibleForOracle: true });
          return child;
        }
      },
      updateChildTotalBudget: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          childId: { type: GraphQLString },
          totalBudget: { type: GraphQLInt }
        },
        resolve: async (_, { workspaceId, childId, totalBudget }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update child workspace."
            );
          }

          const event = await models.Event.create();
          const workspace = await models.Workspace.findById(workspaceId);
          const child = await models.Workspace.findById(childId);
          await workspace.changeAllocationToChild(child, totalBudget, {
            event
          });
        }
      },
      findNextWorkspace: {
        type: workspaceType,
        resolve: async (_, args, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting get next workspace."
            );
          }

          if (user.is_oracle && isInOracleMode.getValue()) {
            await scheduler.assignNextWorkspaceForOracle(user.user_id);
          } else {
            await scheduler.assignNextWorkspace(user.user_id);
          }

          const workspaceId = await scheduler.getIdOfCurrentWorkspace(
            user.user_id
          );
          return { id: workspaceId };
        }
      },
      leaveCurrentWorkspace: {
        type: GraphQLBoolean,
        resolve: async (_, args, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to leave current workspace."
            );
          }
          await scheduler.leaveCurrentWorkspace(user.user_id);
          return true;
        }
      },
      updateWorkspaceIsPublic: {
        type: workspaceType,
        args: {
          isPublic: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { isPublic, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to toggle workspace visiblity."
            );
          }
          if (!user.is_admin) {
            throw new Error(
              "Non-admin attempted to toggle workspace visiblity."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ isPublic });
        }
      },
      updateWorkspaceIsEligible: {
        type: workspaceType,
        args: {
          isEligibleForAssignment: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { isEligibleForAssignment, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update workspace eligibility."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ isEligibleForAssignment });
          return { id: workspaceId };
        }
      },
      updateWorkspaceHasTimeBudget: {
        type: workspaceType,
        args: {
          hasTimeBudget: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { hasTimeBudget, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update workspace time budget status."
            );
          }
          if (!user.is_admin) {
            throw new Error(
              "Non-admin attempted to workspace time budget status."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ hasTimeBudget });
          return { id: workspaceId };
        }
      },
      updateWorkspaceHasIOConstraints: {
        type: workspaceType,
        args: {
          hasIOConstraints: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { hasIOConstraints, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update workspace i/o constraint status."
            );
          }
          if (!user.is_admin) {
            throw new Error(
              "Non-admin attempted to update workspace i/o constraint status."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ hasIOConstraints });
          return { id: workspaceId };
        }
      },
      updateWorkspaceIsEligibleForOracle: {
        type: workspaceType,
        args: {
          isEligibleForOracle: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { isEligibleForOracle, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update oracle eligibility."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ isEligibleForOracle });
        }
      },
      updateAllocatedBudget: {
        type: workspaceType,
        args: {
          workspaceId: { type: GraphQLString },
          changeToBudget: { type: GraphQLInt },
        },
        resolve: async (_, { workspaceId, changeToBudget }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update allocated budet."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          const updatedTimeBudget = Math.min(
            workspace.totalBudget,
            workspace.allocatedBudget + changeToBudget
          );
          await workspace.update({ allocatedBudget: updatedTimeBudget });
        }
      },
      updateTimeSpentOnWorkspace: {
        type: GraphQLBoolean,
        args: {
          doesAffectAllocatedBudget: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString },
          secondsSpent: { type: GraphQLInt },
        },
        resolve: async (_, { doesAffectAllocatedBudget, workspaceId, secondsSpent }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update time spent on workspace."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);

          if (doesAffectAllocatedBudget) {

            const changeToBudget = secondsSpent;

            const updatedTimeBudget = Math.min(
              workspace.totalBudget,
              workspace.allocatedBudget + changeToBudget
            );

            await workspace.update({
              allocatedBudget: updatedTimeBudget,
              timeSpentOnThisWorkspace: workspace.timeSpentOnThisWorkspace + secondsSpent
            });

          } else {

            await workspace.update({
              timeSpentOnThisWorkspace: workspace.timeSpentOnThisWorkspace + secondsSpent,
            });

          }

          return true;
        }
      },
      unlockPointer: {
        type: GraphQLBoolean,
        args: {
          pointerId: { type: GraphQLString },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { pointerId, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to unlock pointer."
            );
          }

          const exportWorkspaceLockRelation = await models.ExportWorkspaceLockRelation.findOne({
            where: {
              pointerId,
              workspaceId,
            }
          });

          if (exportWorkspaceLockRelation) {
            await exportWorkspaceLockRelation.update({ isLocked: false });
          } else {
            await models.ExportWorkspaceLockRelation.create({
              isLocked: false,
              pointerId,
              workspaceId,
            });
          }

          return true;
        }
      }
    }
  })
});

export { schema };
