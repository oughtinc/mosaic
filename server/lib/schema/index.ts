// var models = require('../models');
import models from "../models";
import * as _ from 'lodash';
import { resolver, attributeFields } from 'graphql-sequelize';
import { GraphQLObjectType, GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLInputObjectType } from 'graphql';
import * as aasync from "async";
import * as pluralize from "pluralize";
import * as Case from "Case";
import * as GraphQLJSON from 'graphql-type-json';
import { UpdateWorkspace } from "../workspaceConcerns/updateWorkspace";
import { UpdateWorkspaceBlocks } from "../workspaceConcerns/updateWorkspaceBlocks";
import { CreateChildWorkspace } from "../workspaceConcerns/createChildWorkspace";
import { UpdateChildTotalBudget } from "../workspaceConcerns/updateChildTotalBudget";
import { concernFromJSON } from "../workspaceConcerns";
import { WorkspaceMutation } from "../workspaceConcerns/WorkspaceMutation";

const generateReferences = (model, references) => {
  let all = {};
  references.map(r => {
    all[r[0]] = {
      type: r[1](),
      resolve: resolver(model[r[2]])
    }
  })
  return all
}

const makeObjectType = (model, references, extraFields = {}) => (
  new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () => _.assign(attributeFields(model), generateReferences(model, references), extraFields)
  })
)

let standardReferences = [
  ['createdAtEvent', () => eventType, 'CreatedAtEvent'],
  ['updatedAtEvent', () => eventType, 'UpdatedAtEvent'],
]

let blockType = makeObjectType(models.Block,
  [
    ...standardReferences,
    ['workspace', () => workspaceType, 'Workspace'],
  ]
)

let workspaceType = makeObjectType(models.Workspace,
  [
    ...standardReferences,
    ['childWorkspaces', () => new GraphQLList(workspaceType), 'ChildWorkspaces'],
    ['parentWorkspace', () => new GraphQLList(workspaceType), 'ParentWorkspace'],
    ['blocks', () => new GraphQLList(blockType), 'Blocks'],
    ['pointerImports', () => new GraphQLList(pointerImportType), 'PointerImports'],
  ]
)

let eventType = makeObjectType(models.Event, [])

let pointerType = makeObjectType(models.Pointer,
  [
    ...standardReferences,
    ['pointerImport', () => pointerImportType, 'PointerImport'],
    ['sourceBlock', () => blockType, 'SourceBlock'],
  ],
)

let pointerImportType = makeObjectType(models.PointerImport,
  [
    ...standardReferences,
    ['workspace', () => blockType, 'Workspace'],
    ['pointer', () => pointerType, 'Pointer'],
  ]
)

const BlockInput = new GraphQLInputObjectType({
  name: "blockInput",
  fields: _.pick(attributeFields(models.Block), 'value', 'id'),
})

function modelGraphQLFields(type, model) {
  return ({
    type,
    args: { where: { type: GraphQLJSON } },
    resolve: resolver(model)
  })
}

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      workspaces: modelGraphQLFields(new GraphQLList(workspaceType), models.Workspace),
      workspace: {
        type: workspaceType,
        args: { id: { type: GraphQLString } },
        resolve: resolver(models.Workspace)
      },
      subtreeWorkspaces: {
        type: new GraphQLList(workspaceType),
        args: { workspaceId: { type: GraphQLString } },
        resolve: async (_, { workspaceId }) => {
          const rootWorkspace = await models.Workspace.findById(workspaceId)
          const children = await rootWorkspace.subtreeWorkspaces();
          return [rootWorkspace, ...children]
        },
      },
      blocks: modelGraphQLFields(new GraphQLList(blockType), models.Block),
      pointers: modelGraphQLFields(new GraphQLList(pointerType), models.Pointer),
      events: modelGraphQLFields(new GraphQLList(eventType), models.Event),
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createWorkspace: {
        type: workspaceType,
        args: { question: { type: GraphQLJSON }, totalBudget: {type: GraphQLInt} },
        resolve: async (_, { question, totalBudget }) => {
          const event = await models.Event.create()
          const workspace = await models.Workspace.create({totalBudget}, { event, questionValue: JSON.parse(question) })
          return workspace
        }
      },
      updateBlocks: {
        type: workspaceType,
        args: { workspaceId: { type: GraphQLString }, blocks: { type: new GraphQLList(BlockInput) } },
        resolve: async (_, { workspaceId, blocks }) => {
          const workspaceMutation = new WorkspaceMutation({
            workspaceId: workspaceId,
            mutationClass: UpdateWorkspaceBlocks, 
            params: {blocks}
          })
          return await workspaceMutation.run();
        }
      },
      updateWorkspace: {
        type: workspaceType,
        args: { id: { type: GraphQLString }, childWorkspaceOrder: { type: new GraphQLList(GraphQLString) } },
        resolve: async (_, { id, childWorkspaceOrder }) => {
          const workspaceMutation = new  WorkspaceMutation({
            workspaceId: id,
            mutationClass: UpdateWorkspace, 
            params: {childWorkspaceOrder}
          })
          return await workspaceMutation.run();
        }
      },
      createChildWorkspace: {
        type: workspaceType,
        args: { workspaceId: { type: GraphQLString }, question: { type: GraphQLJSON }, totalBudget: {type: GraphQLInt} },
        resolve: async (_, { workspaceId, question, totalBudget }) => {
          const workspaceMutation = new WorkspaceMutation({
            workspaceId,
            mutationClass: CreateChildWorkspace, 
            params: {question, totalBudget}
          })
          return await workspaceMutation.run();
        }
      },
      updateChildTotalBudget: {
        type: workspaceType,
        args: { workspaceId: { type: GraphQLString }, childId: { type: GraphQLString }, totalBudget: { type: GraphQLInt } },
        resolve: async (_, { workspaceId, childId, totalBudget }) => {
          const workspaceMutation = new WorkspaceMutation({
            workspaceId,
            mutationClass: UpdateChildTotalBudget, 
            params: {childId, totalBudget}
          })
          return await workspaceMutation.run();
        }
      },
    }
  })
});

export {schema};