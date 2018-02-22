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

const makeObjectType = (model, references) => (
  new GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: () => _.assign(attributeFields(model), generateReferences(model, references))
  })
)

let blockType = makeObjectType(models.Block,
  [['blockVersions', () => new GraphQLList(blockVersionType), 'BlockVersions']]
)

let blockVersionType = makeObjectType(models.BlockVersion, []
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
  ]
)
// {workspaceId: {type: GraphQLString}, ..._.pick(attributeFields(models.BlockVersion), ['blockId', 'value'])},
const BlockInput = new GraphQLInputObjectType({
  name: "blockVersionInput",
  fields: _.pick(attributeFields(models.BlockVersion), 'value', 'blockId'),
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
        type: blockVersionType,
        args: {workspaceId: {type: GraphQLString}, blockVersions: {type: new GraphQLList(BlockInput)}},
        resolve: async (a, {workspaceId, blockVersions}) => {
          const workspace = await models.Workspace.findById(workspaceId)
        const recent = await workspace.recentWorkspaceVersion();
          await workspace.updateBlockVersions(blockVersions);
          return {value: "sdafasdf"}
        }
      }
    }
  })
});

export {schema};