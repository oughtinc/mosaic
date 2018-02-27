var models = require('../models');
import * as _ from 'lodash';
import { resolver, attributeFields } from 'graphql-sequelize';
import { GraphQLObjectType, GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLInputObjectType } from 'graphql';
import * as aasync from "async";
import * as pluralize from "pluralize";
import * as Case from "Case";

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

const makeObjectType = (model, references) => {
  return new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () => _.assign(attributeFields(model), generateReferences(model, references))
  })
}

let blockType = makeObjectType(models.Block,
  [
    ['blockVersions', () => new GraphQLList(blockVersionType), 'BlockVersions'],
    ['pointers', () => new GraphQLList(pointerType), 'Pointers']
  ],
)

let blockVersionType = makeObjectType(models.BlockVersion, [
    ['workspaceImportPointerVersions', () => new GraphQLList(workspaceImportPointerVersionType), 'WorkspaceImportPointerVersions']
  ]
)

let workspaceType = makeObjectType(models.Workspace,
  [
    ['questionBlock', () => blockType, 'QuestionBlock'],
    ['answerBlock', () => blockType, 'AnswerBlock'],
    ['scratchpadBlock', () => blockType, 'ScratchpadBlock'],
    ['workspaceVersions', () => new GraphQLList(workspaceVersionType), 'WorkspaceVersions']
  ]
)

let workspaceVersionType = makeObjectType(models.WorkspaceVersion,
  [
    ['questionBlockVersion', () => blockVersionType, 'QuestionBlockVersion'],
    ['answerBlockVersion', () => blockVersionType, 'AnswerBlockVersion'],
    ['scratchpadBlockVersion', () => blockVersionType, 'ScratchpadBlockVersion'],
    ['workspacePointerCollectionVersion', () => workspacePointerCollectionVersionType, 'WorkspacePointerCollectionVersion']
  ]
)

let workspaceImportPointerVersionType = makeObjectType(models.WorkspaceImportPointerVersion,
  [
    ['pointer', () => pointerType, 'Pointer'],
    ['blockVersion', () => blockVersionType, 'BlockVersion'],
    ['workspacePointerCollectionVersion', () => workspacePointerCollectionVersionType, 'WorkspacePointerCollectionVersion']
  ]
)

let workspacePointerCollectionVersionType = makeObjectType(models.WorkspacePointerCollectionVersion,
  [
    ['workspace', () => workspaceType, 'Workspace'],
    ['workspaceImportPointerVersions', () => new GraphQLList(workspaceImportPointerVersionType), 'WorkspaceImportPointerVersions']
  ]
)

let pointerType = makeObjectType(models.Pointer,
  [
    ['sourceBlock', () => blockType, 'SourceBlock'],
    ['workspaceImportPointerVersions', () => new GraphQLList(workspaceImportPointerVersionType), 'WorkspaceImportPointerVersions']
  ]
)

const BlockInput = new GraphQLInputObjectType({
  name: "blockVersionInput",
  fields: _.pick(attributeFields(models.BlockVersion), 'value', 'blockId'),
})

const PointerInput = new GraphQLInputObjectType({
  name: "PointerInput",
  fields: _.pick(attributeFields(models.Pointer), 'value', 'pointerId'),
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
      updateBlockVersions: {
        type: workspaceType,
        args: {workspaceId: {type: GraphQLString}, blockVersions: {type: new GraphQLList(BlockInput)}},
        resolve: async (_, {workspaceId, blockVersions}) => {
          const workspace = await models.Workspace.findById(workspaceId)
          const recent = await workspace.recentWorkspaceVersion();
          await workspace.updateBlockVersions(blockVersions);
          return workspace
        }
      },
      updateWorkspace: {
        type: workspaceType,
        args: {workspaceId: {type: GraphQLString}, childWorkspaceOrder: {type: new GraphQLList(GraphQLString)}},
        resolve: async (_, {workspaceId, childWorkspaceOrder}) => {
          const workspace = await models.Workspace.findById(workspaceId)
          return workspace.createWorkspaceVersion({childWorkspaceOrder})
        }
      },
      createChildWorkspace: {
        type: workspaceType,
        args: {workspaceId: {type: GraphQLString}},
        resolve: async(_, {workspaceId}) => {
          const workspace = await models.Workspace.findById(workspaceId)
          const child = await workspace.createChild(); 
          return child
        }
      },
      createPointer: {
        type: pointerType,
        args: {blockId: {type: GraphQLString}},
        resolve: async(_, {blockId}) => {
          const block = await models.Block.findById(blockId)
          const pointer = await workspace.createPointer(); 
          return pointer
        }
      }
    }
  })
});

export {schema};