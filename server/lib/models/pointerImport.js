'use strict';
import Sequelize from 'sequelize';
import addEvents from './addEvents.js';

const PointerImportModel = (sequelize, DataTypes) => {
  var PointerImport = sequelize.define('PointerImport', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...addEvents().eventRelationshipColumns(DataTypes),
  }, {
    hooks: {
        ...addEvents().beforeValidate,
    },
  })

  PointerImport.associate = function(models){
    PointerImport.Pointer = PointerImport.belongsTo(models.Pointer, {as: 'pointer', foreignKey: 'pointerId'})
    PointerImport.Workspace = PointerImport.belongsTo(models.Workspace, {as: 'workspace', foreignKey: 'workspaceId'})
    addEvents().run(PointerImport, models)
  }

  return PointerImport
};

export default PointerImportModel