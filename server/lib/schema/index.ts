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

const makeObjectType = (model, references, extraFields={}) => (
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

let workspaceType = makeObjectType(models.Workspace,
  [
    ...standardReferences,
  ]
)

let eventType = makeObjectType(models.Event,[])

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      workspaces: {
        type: new GraphQLList(workspaceType),
        args: {where: {type: GraphQLJSON}},
        resolve: resolver(models.Workspace)
      },
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields : {
    }
  })
});

export {schema};