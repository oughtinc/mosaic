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
      WorkspacePointerCollectionVersion.Transaction = WorkspacePointerCollectionVersion.hasOne(models.Transaction, {as: 'transaction', foreignKey: "transactionId"})
      WorkspacePointerCollectionVersion.Workspace = WorkspacePointerCollectionVersion.belongsTo(models.Workspace, {foreignKey: 'workspaceId'})
      WorkspacePointerCollectionVersion.WorkspaceImportPointerVersions = WorkspacePointerCollectionVersion.hasMany(models.WorkspaceImportPointerVersion, {foreignKey: 'workspacePointersCollectionVersionId'})
  }
  return WorkspacePointerCollectionVersion
}