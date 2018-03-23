import Sequelize from 'sequelize';
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';
import _ = require('lodash');

function getInlinesAsArray(node) {
  let array: any = [];

  node.nodes.forEach((child) => {
    if (child.object === "text") { return; }
    if (child.object === "inline") {
      array.push(child);
    } else {
      array = array.concat(getInlinesAsArray(child));
    }
  });

  return array;
}

const PointerModel = (sequelize, DataTypes) => {
  var Pointer = sequelize.define('Pointer', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
    value: {
      type: Sequelize.VIRTUAL(Sequelize.JSON, ['id', 'sourceBlockId']), 
      get: async function() {
        const pointerId = this.get("id");
        const sourceBlockId = this.get("sourceBlockId");
        const sourceBlock = await sequelize.models.Block.findById(sourceBlockId)
        const {cachedExportPointerValues} = sourceBlock;
        return cachedExportPointerValues[pointerId]
      }
    },
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

  Pointer.prototype.containedPointerIds = async function(sequelize) {
    const directIds = await this.directImportingPointerIds()
    let importingIds = directIds
    for (const id of importingIds){
      const pointer = await sequelize.models.Pointer.findById(id);
      const directImports = await pointer.directContainedPointerIds(sequelize);
      directImports.filter(i => !_.includes(importingIds, i)).forEach(i => {
        importingIds.push(i)
      })
    }
    return importingIds
  }

  Pointer.prototype.directContainedPointerIds = async function(sequelize) {
    const value = await this.value
    const inlines =  getInlinesAsArray(value)
    const pointers =  inlines.filter((l) => !!l.data.pointerId)
    const pointerIds = pointers.map(p => p.data.pointerId)
    return pointerIds
  }

  return Pointer
};

export default PointerModel;