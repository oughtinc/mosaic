'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var WorkspacePointerCollectionVersion = sequelize.define('WorkspacePointerCollectionVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
  })
  WorkspacePointerCollectionVersion.associate = function(models){
      WorkspacePointerCollectionVersion.Workspace = WorkspacePointerCollectionVersion.belongsTo(models.Workspace, {foreignKey: 'workspaceId'})
      WorkspacePointerCollectionVersion.WorkspacePointerInputVersions = WorkspacePointerCollectionVersion.hasMany(models.WorkspacePointerInputVersion, {foreignKey: 'workspacePointersCollectionVersionId'})
  }
  return WorkspacePointerCollectionVersion
}