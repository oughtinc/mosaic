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
    },
  })
  Pointer.associate = function(models){
      Pointer.SourceBlock = Pointer.belongsTo(models.Block, {as: 'sourceBlock', foreignKey: 'sourceBlockId'})
      Pointer.WorkspaceImportPointerVersions = Pointer.hasMany(models.WorkspaceImportPointerVersion, {as: 'workspaceImportPointerVersions', foreignKey: 'pointerId'})
  }
  return Pointer
}