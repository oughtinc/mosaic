'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const WorkspaceVersionModel = (sequelize, DataTypes) => {
  var WorkspaceVersion = sequelize.define('WorkspaceVersion', {
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
  WorkspaceVersion.associate = function (models) {
    addEventAssociations(WorkspaceVersion, models)
  }

  return WorkspaceVersion;
};

export default WorkspaceVersionModel;