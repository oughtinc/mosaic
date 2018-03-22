'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const NodeVersionModel = (sequelize, DataTypes) => {
  var NodeVersion = sequelize.define('NodeVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
  }, {
      hooks: {
        ...eventHooks.beforeValidate,
    }
  });
  NodeVersion.associate = function (models) {
    addEventAssociations(NodeVersion, models)
  }

  return NodeVersion;
};

export default NodeVersionModel;