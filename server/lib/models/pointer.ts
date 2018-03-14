import Sequelize from 'sequelize';
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const PointerModel = (sequelize, DataTypes) => {
  var Pointer = sequelize.define('Pointer', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
  }, {
    hooks: {
        beforeValidate: eventHooks.beforeValidate,
    },
  })

  Pointer.associate = function(models){
    Pointer.SourceBlock = Pointer.belongsTo(models.Block, {as: 'sourceBlock', foreignKey: 'sourceBlockId'})
    Pointer.PointerImports = Pointer.hasMany(models.PointerImport, {as: 'pointerImport', foreignKey: 'pointerId'})
    addEventAssociations(Pointer, models)
  }

  Pointer.prototype.importingWorkspaces = async function() {
    let workspaces = []
    const pointerImports = await this.getPointerImports()
    for (const pointerImport of pointerImports) {
      workspaces = [...workspaces, await pointerImport.getWorkspace()]
    }
    return workspaces
  }

  return Pointer
};

export default PointerModel;