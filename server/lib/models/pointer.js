import Sequelize from 'sequelize';
import addEvents from './addEvents.js';

const PointerModel = (sequelize, DataTypes) => {
  var Pointer = sequelize.define('Pointer', {
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

  Pointer.associate = function(models){
    Pointer.SourceBlock = Pointer.belongsTo(models.Block, {as: 'sourceBlock', foreignKey: 'sourceBlockId'})
    Pointer.PointerImports = Pointer.hasMany(models.PointerImport, {as: 'pointerImport', foreignKey: 'pointerId'})
    addEvents().run(Pointer, models)
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