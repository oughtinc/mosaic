'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var WorkspaceVersion = sequelize.define('WorkspaceVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    childWorkspaceOrder: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    //This field represents cached data. You can find it from the relevant timestamps.
    childWorkspaceVersionIds: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    //This field represents cached data. You can find it from checking if its in the childWorkspaceOrder of its parent.
    isArchived: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false
    },
  });

  WorkspaceVersion.associate = function (models) {
    WorkspaceVersion.Transaction = WorkspaceVersion.hasOne(models.Transaction, { as: 'transaction', foreignKey: "transactionId" })
    WorkspaceVersion.Workspace = WorkspaceVersion.belongsTo(models.Workspace, { foreignKey: 'workspaceId' })
    WorkspaceVersion.QuestionBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'questionBlockVersion', foreignKey: 'questionVersionId' })
    WorkspaceVersion.AnswerBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'answerBlockVersion', foreignKey: 'answerVersionId' })
    WorkspaceVersion.ScratchpadBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'scratchpadBlockVersion', foreignKey: 'scratchpadVersionId' })
    WorkspaceVersion.WorkspacePointerCollectionVersion = WorkspaceVersion.belongsTo(models.WorkspacePointerCollectionVersion, { as: 'workspacePointerCollectionVersion', foreignKey: 'workspacePointersCollectionVersionId' })
  }

  WorkspaceVersion.prototype.getWorkspacePointerInputVersions = async function () {
    const collection = await this.getWorkspacePointerCollectionVersion();
    return await collection.getWorkspacePointerInputVersions()
  }

  WorkspaceVersion.createWithExportedPointerVersions = async function (oldWorkspaceVersion, transaction, modifiedExportedPointerVersions) {

    async function createUpdatedPointerInputVersion(_pointerInputVersion, _newPointerCollectionVersion, _modifiedExportedPointerVersions){
      let newInputs = { transactionId: transaction.id, workspacePointerCollectionVersionId: _newPointerCollectionVersion.id }
      const modifiedPointer = _modifiedExportedPointerVersions.find(m => m.pointerId === _pointerInputVersion.exportingPointerId)
      if (modifiedPointer) {
        newInputs.exportingBlockVersionId = modifiedPointer.exportingBlockVersionId
      }
      await sequelize.models.WorkspaceImportPointerVersion.createNewVersionForTransaction({
        previousWorkspaceImportPointerVersion: _pointerInputVersion,
        ...newInputs
      })
    }

    async function createNewPointerCollectionVersion() {
      const oldPointerCollectionVersion = await oldWorkspaceVersion.getWorkspacePointerCollectionVersion();
      const oldPointerInputVersions = await oldPointerCollectionVersion.getWorkspacePointerInputVersions()

      const newPointerCollectionVersion = await oldWorkspaceVersion.createWorkspacePointerCollectionVersion({ transactionId: transaction.id })

      for (const pointerInputVersion of oldPointerInputVersions) {
        await createUpdatedPointerInputVersion(pointerInputVersion, newPointerCollectionVersion, modifiedExportedPointerVersions)
      }

      return newPointerCollectionVersion
    }


    const newPointerCollectionVersion = await createNewPointerCollectionVersion()
    const workspace = await oldWorkspaceVersion.getWorkspace()
    const newWorkspaceVersion = await workspace.createWorkspaceVersion({
      transactionId: transaction.id,
      workspacePointersCollectionVersionId: newPointerCollectionVersion.id
    })

    await newWorkspaceVersion.ensureWorkspaceVersionConsistency(transaction)

    return newWorkspaceVersion
  }

  WorkspaceVersion.prototype.getWorkspacePointerInputVersions = async function () {
    const workspacePointerCollectionVersion = this.getWorkspacePointerCollectionVersion();
    const inputVersions = workspacePointerCollectionVersion.getWorkspacePointerInputVersions();
    return inputVersions
  }

  WorkspaceVersion.prototype.getBlockVersions = async function () {
    const questionBlock = await this.getQuestionBlockVersion();
    const answerBlock = await this.getAnswerBlockVersion();
    const scratchpadBlock = await this.getScratchpadBlockVersion();
    return [questionBlock, answerBlock, scratchpadBlock]
  }

  WorkspaceVersion.prototype.importingPointerIds = async function () {
    const blockVersions = this.getBlockVersions()
    let cachedImportPointerIds = []
    return _.uniq(_.flatten(blockVersions.map(b => b.cachedImportPointerIds)))
  }

  //-------------------------------------------------------------------------------------------------
  WorkspaceVersion.prototype.ensureWorkspaceVersionConsistency = async function (transaction) {
    await this.ensureAllBlockVersionInputsInPointerInputs(transaction)
    //Later we could ensure consistency in other ways
  }

  //Makes a list of all pointerIds that are imported in the workspace, but not included in WorkspacePointerInputVersions
  WorkspaceVersion.prototype.missingImportPointerIds = async function () {
    const importingPointerIds = await this.importingPointerIds()
    const oldPointerInputVersions = await this.getWorkspacePointerInputVersions()
    return _.difference(importingPointerIds, oldPointerInputVersions.map(v => v.exportingPointerId))
  }

  WorkspaceVersion.prototype.ensureAllBlockVersionInputsInPointerInputs = async function (transaction) {
    const missingImportPointerIds = this.missingImportPointerIds()
    for (const missingImportPointerId of missingImportPointerIds) {
      sequelize.models.WorkspaceImportPointerVersion.findExportingBlockAndCreate({
        exportingPointerId: missingImportPointerId,
        transactionId: transaction.id,
        workspacePointersCollectionVersionId: this.workspacePointersVersionId
      })
    }
  }
  //-------------------------------------------------------------------------------------------------

  return WorkspaceVersion;
};