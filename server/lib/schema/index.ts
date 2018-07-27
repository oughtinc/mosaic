import * as models from "../models";
import * as _ from "lodash";
import { resolver, attributeFields } from "graphql-sequelize";
import {
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

  return new Promise(resolve => {
    webAuth.client.userInfo(accessToken, function(err: any, user: any) {
      if (err != null) {
        console.log("UserInfo error:", err);
        return resolve(null);
      }
      const metadataKey = "https://mosaic:auth0:com/app_metadata";
      const isAdmin = user[metadataKey] ? user[metadataKey].is_admin : false;
      return resolve({ user_id: user.sub, is_admin: isAdmin });
    });
  });
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
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
        resolve: resolver(models.Workspace)
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
            if (
              workspace.isPublic &&
              !user.is_admin &&
              user.user_id !== workspace.creatorId
            ) {
              throw new Error(
                "Non-admin user attempted to edit block on public workspace"
              );
            }
            await block.update({ ..._block }, { event });
            newBlocks = [...newBlocks, block];
          }
          return newBlocks;
        }
      },
      updateWorkspace: {
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
          if (!user.is_admin && workspace.creatorId !== user.user_id) {
            throw new Error(
              "Non-admin, non-creator user attempted to create child workspace"
            );
          }
          const event = await models.Event.create();
          const child = await workspace.createChild({
            event,
            question: JSON.parse(question),
            totalBudget,
            creatorId: user.user_id,
            isPublic: user.is_admin
          });
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
          if (!user.is_admin && workspace.creatorId !== user.user_id) {
            throw new Error(
              "Non-admin, non-creator user attempted to update child workspace"
            );
          }
          const child = await models.Workspace.findById(childId);
          await workspace.changeAllocationToChild(child, totalBudget, {
            event
          });
        }
      }
    }
  })
});

export { schema };
