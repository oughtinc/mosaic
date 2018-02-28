'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

const UPDATABLE_VALUES = ['isExpanded', 'exportingBlockVersionId', 'exportingPointerId', 'workspacePointersCollectionVersion']

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

  WorkspaceImportPointerVersion.associate = function (models) {
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

  //This method allows one to create a WorkspaceImportPointerVersion without giving it the exportingBlockVersionId; it finds this automatically.
  //TODO: This finds the most recent source block version, which could be (though it's unlikely) different than that of the ongoing transaction.
  WorkspaceImportPointerVersion.findExportingBlockAndCreate = async function ({ exportingPointerId, transactionId, workspacePointersCollectionVersionId }) {
      const pointer = await sequelize.models.Pointer.findById(exportingPointerId);
      const recentSourceBlockVersion = await pointer.recentSourceBlockVersion()
      return await sequelize.models.WorkspaceImportPointerVersion.create({
        isExpanded: false,
        exportingBlockVersionId: recentSourceBlockVersion.id,
        transactionId,
        exportingPointerId,
        workspacePointersCollectionVersionId
      })
  }

  WorkspaceImportPointerVersion.createNewVersionForTransaction = async function (newInputs) {
    // let newInputs = {transactionId, workspacePointerCollectionVersionId}
    const previousValues = oldWorkspaceImportPointerVersion.dataValues
    const newValue = {...previousValues, ...newInputs}
    return await sequelize.models.WorkspaceImportPointerVersion.create(_.pick(newValue, UPDATABLE_VALUES))
  }

  return WorkspaceImportPointerVersion
}