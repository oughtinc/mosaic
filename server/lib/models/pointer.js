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
      Pointer.WorkspacePointerInputVersions = Pointer.hasMany(models.WorkspacePointerInputVersion, {as: 'workspacePointerInputVersions', foreignKey: 'pointerId'})
  }
  return Pointer
}