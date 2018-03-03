var models = require('../models');
import * as _ from 'lodash';
import { resolver, attributeFields } from 'graphql-sequelize';
import { GraphQLObjectType, GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLInputObjectType } from 'graphql';
import * as aasync from "async";
import * as pluralize from "pluralize";
import * as Case from "Case";
import GraphQLJSON from 'graphql-type-json';
import Sequelize from 'sequelize'

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

const makeObjectType = (model, references) => (
  new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () => _.assign(attributeFields(model), generateReferences(model, references))
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
    ['blocks', () => new GraphQLList(blockType), 'Blocks'],
  ]
)

let eventType = makeObjectType(models.Event,[])

let pointerType = makeObjectType(models.Pointer,
  [
    ...standardReferences,
    ['pointerImport', () => pointerImportType, 'PointerImport']
    ['sourceBlock', () => blockType, 'SourceBlock'],
  ]
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

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      workspaces: {
        type: new GraphQLList(workspaceType),
        resolve: resolver(models.Workspace)
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields : {
      updateBlocks: {
        type: new GraphQLList(blockType),
        args: {workspaceId: {type: GraphQLString}, blocks: {type: new GraphQLList(BlockInput)}},
        resolve: async (_, {workspaceId, blocks}) => {
          const event = await models.Event.create()
          let newBlocks = []
          for (const _block of blocks){
            const block = await models.Block.findById(_block.id)
            await block.update({..._block}, {event})
            newBlocks = [...newBlocks, block]
          }
          return newBlocks
        }
      },
      updateWorkspace: {
        type: workspaceType,
        args: {workspaceId: {type: GraphQLString}, childWorkspaceOrder: {type: new GraphQLList(GraphQLString)}},
        resolve: async (_, {workspaceId, childWorkspaceOrder}) => {
          const workspace = await models.Workspace.findById(workspaceId)
          const event = await models.Event.create()
          return workspace.update({childWorkspaceOrder}, {event})
        }
      },
      createChildWorkspace: {
        type: workspaceType,
        args: {workspaceId: {type: GraphQLString}, question: {type: GraphQLJSON}},
        resolve: async(_, {workspaceId, question}) => {
          const workspace = await models.Workspace.findById(workspaceId)
          const event = await models.Event.create()
          const child = await workspace.createChild({event, question})
          return child
        }
      },
    }
  })
});

export {schema};