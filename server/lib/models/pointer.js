'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var Pointer = sequelize.define('Pointer', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    }
  })

  Pointer.associate = function(models){
      Pointer.Transaction = Pointer.hasOne(models.Transaction, {as: 'transaction', foreignKey: "transactionId"})
      Pointer.SourceBlock = Pointer.belongsTo(models.Block, {as: 'sourceBlock', foreignKey: 'sourceBlockId'})
      Pointer.WorkspaceImportPointerVersions = Pointer.hasMany(models.WorkspaceImportPointerVersion, {as: 'workspaceImportPointerVersions', foreignKey: 'pointerId'})
  }

  Pointer.prototype.importingWorkspaceIds = async function() {
    const workspaceImportPointerVersions = this.getWorkspaceImportPointerVersions();
    const workspacePointerCollectionIds = _.uniq(workspaceImportPointerVersions.map(e => e.workspacePointersCollectionVersionId))
    let workspaceCollections = []
    for (const id of workspacePointerCollectionIds) {
      const collection = await sequelize.models.WorkspacePointerCollectionVersion.findById(id)
      workspaceCollections.push(collection)
    }
    const workspaceIds = _.uniq(workspaceCollections.map(w => w.workspaceId))
    return workspaceIds
  }

  Pointer.prototype.recentSourceBlockVersion = async function() {
    const block = await this.getSourceBlock()
    const blockVersion = await block.recentBlockVersion()
    return blockVersion
  }

  Pointer.prototype.recentVersion = async function() {
    const blockVersion = await this.recentSourceBlockVersion()
    return blockVersion.cachedOutputPointerValues[this.id]
  }

  return Pointer
}