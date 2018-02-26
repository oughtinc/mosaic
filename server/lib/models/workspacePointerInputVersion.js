'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var WorkspacePointerInputVersion = sequelize.define('WorkspacePointerInputVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    isExpanded: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false
    },
  })
  WorkspacePointerInputVersion.associate = function(models){
      WorkspacePointerInputVersion.Pointer = WorkspacePointerInputVersion.belongsTo(
        models.Pointer, {
          as: 'pointer',
          foreignKey: 'pointerId'
        }
      )
      WorkspacePointerInputVersion.BlockVersion = WorkspacePointerInputVersion.belongsTo(
        models.BlockVersion, {
          as: 'blockVersion',
          foreignKey: 'blockVersionId'
        }
      )
      WorkspacePointerInputVersion.WorkspacePointerCollectionVersion = WorkspacePointerInputVersion.belongsTo(
        models.WorkspacePointerCollectionVersion, {
          as: 'workspacePointersCollectionVersion',
          foreignKey: 'workspacePointersCollectionVersionId'
        }
      )
  }
  return WorkspacePointerInputVersion
}