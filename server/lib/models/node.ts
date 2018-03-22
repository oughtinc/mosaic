'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const NodeModel = (sequelize, DataTypes) => {
  var Node = sequelize.define('Node', {
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
  Node.associate = function (models) {
    addEventAssociations(Node, models)
  }

  return Node;
};

export default NodeModel;