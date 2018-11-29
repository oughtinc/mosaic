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
      events: modelGraphQLFields(new GraphQLList(eventType), models.Event)
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
      updateWorkspaceStaleness: {
        type: workspaceType,
        args: {
          id: { type: GraphQLString },
          isStale: { type: GraphQLBoolean }
        },
        resolve: async (_, { id, isStale }) => {
          const workspace = await models.Workspace.findById(id);
          const event = await models.Event.create();
          return workspace.update({ isStale }, { event });
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
            totalBudget: parent.totalBudget + childRemainingBudget
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
              "Non-admin attempted to toggle workspace visiblity"
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ isPublic });
        }
      },
      updateWorkspaceIsEligible: {
        type: workspaceType,
        args: {
          isEligible: { type: GraphQLBoolean },
          workspaceId: { type: GraphQLString }
        },
        resolve: async (_, { isEligible, workspaceId }, context) => {
          const user = await userFromAuthToken(context.authorization);
          if (user == null) {
            throw new Error(
              "No user found when attempting to update workspace eligibility."
            );
          }
          const workspace = await models.Workspace.findById(workspaceId);
          await workspace.update({ isEligibleForAssignment: isEligible });
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
          console.log(`





            HERE~~





          `)
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
          changeToBudget: { type: GraphQLInt }
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
      }
    }
  })
});

export { schema };
