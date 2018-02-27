'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var WorkspaceImportPointerVersion = sequelize.define('WorkspaceImportPointerVersion', {
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
  WorkspaceImportPointerVersion.associate = function(models){

      WorkspaceImportPointerVersion.Transaction = WorkspaceImportPointerVersion.hasOne(
        models.Transaction, {
          as: 'transaction',
          foreignKey: "transactionId"
        }
      )
      WorkspaceImportPointerVersion.Pointer = WorkspaceImportPointerVersion.belongsTo(
        models.Pointer, {
          as: 'pointer',
          foreignKey: 'pointerId'
        }
      )
      WorkspaceImportPointerVersion.BlockVersion = WorkspaceImportPointerVersion.belongsTo(
        models.BlockVersion, {
          as: 'blockVersion',
          foreignKey: 'blockVersionId'
        }
      )
      WorkspaceImportPointerVersion.WorkspacePointerCollectionVersion = WorkspaceImportPointerVersion.belongsTo(
        models.WorkspacePointerCollectionVersion, {
          as: 'workspacePointersCollectionVersion',
          foreignKey: 'workspacePointersCollectionVersionId'
        }
      )
  }
  return WorkspaceImportPointerVersion
}