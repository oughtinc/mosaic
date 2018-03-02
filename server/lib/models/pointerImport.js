'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
const addEvents = require('./addEvents.js');

module.exports = (sequelize, DataTypes) => {
  var PointerImport = sequelize.define('PointerImport', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...addEvents().eventRelationshipColumns(DataTypes),
  })

  PointerImport.associate = function(models){
    PointerImport.Pointer = PointerImport.belongsTo(models.Pointer, {as: 'pointer', foreignKey: 'pointerId'})
    PointerImport.Workspace = PointerImport.belongsTo(models.Workspace, {as: 'workspace', foreignKey: 'workspaceId'})
    addEvents().run(PointerImport, models)
  }

  return PointerImport
};