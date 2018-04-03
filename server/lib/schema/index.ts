// var models = require('../models');
import models from "../models";
import * as _ from 'lodash';
import { resolver, attributeFields } from 'graphql-sequelize';
import { GraphQLObjectType, GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLInputObjectType } from 'graphql';
import * as aasync from "async";
import * as pluralize from "pluralize";
import * as Case from "Case";
import * as GraphQLJSON from 'graphql-type-json';

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
      updateBlocks: {
        type: new GraphQLList(blockType),
        args: { workspaceId: { type: GraphQLString }, blocks: { type: new GraphQLList(BlockInput) } },
        resolve: async (_, { workspaceId, blocks }) => {
          const event = await models.Event.create()
          let newBlocks: any = []
          for (const _block of blocks) {
            const block = await models.Block.findById(_block.id)
            await block.update({ ..._block }, { event })
            newBlocks = [...newBlocks, block]
          }
          return newBlocks
        }
      },
      updateWorkspace: {
        type: workspaceType,
        args: { id: { type: GraphQLString }, childWorkspaceOrder: { type: new GraphQLList(GraphQLString) } },
        resolve: async (_, { id, childWorkspaceOrder }) => {
          const workspace = await models.Workspace.findById(id)
          const event = await models.Event.create()
          return workspace.update({ childWorkspaceOrder }, { event })
        }
      },
      createWorkspace: {
        type: workspaceType,
        args: { question: { type: GraphQLJSON }, budget: {type: GraphQLInt} },
        resolve: async (_, { question, budget }) => {
          const event = await models.Event.create()
          const workspace = await models.Workspace.create({budget}, { event, questionValue: JSON.parse(question) })
          return workspace
        }
      },
      createChildWorkspace: {
        type: workspaceType,
        args: { workspaceId: { type: GraphQLString }, question: { type: GraphQLJSON }, budget: {type: GraphQLInt} },
        resolve: async (_, { workspaceId, question, budget }) => {
          const workspace = await models.Workspace.findById(workspaceId)
          const event = await models.Event.create()
          const child = await workspace.createChild({ event, question: JSON.parse(question), budget })
          return child
        }
      },
    }
  })
});

export {schema};