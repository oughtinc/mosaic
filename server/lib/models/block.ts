import Sequelize from 'sequelize';
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';
import {Value} from "slate"
import _ = require('lodash');

function getInlinesAsArray(node) {
  let array: any = [];

  node.nodes.forEach((child) => {
    if (child.object === "text") { return; }
    if (child.object === "inline") {
      array.push(child);
    }
    if (!child.isLeafInline()) {
      array = array.concat(getInlinesAsArray(child));
    }
  });

  return array;
}

function exportingNodes(node: any) {
    const _getInlinesAsArray = getInlinesAsArray(node).map((n) => n.toJSON());
    const pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerExport");
    return pointers;
}

function importingNodes(node: any) {
    const _getInlinesAsArray = getInlinesAsArray(node).map((n) => n.toJSON());
    const pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerImport");
    return pointers;
}

async function importingPointerIds(item, sequelize){
  if (!item.dataValues.value) { return [] }
  const value = Value.fromJSON(item.dataValues.value)
  const _getInlinesAsArray = getInlinesAsArray(value.document).map((n) => n.toJSON());
  let pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerImport" || l.type === "pointerExport");
  let pointerIds = pointers.map(p => p.data.pointerId);
  for (const p of pointers){
    const _pointer = await sequelize.models.Pointer.findById(p.data.pointerId)
    const subPointerIds = await _pointer.containedPointerIds(sequelize);
    pointerIds = [...pointerIds, ...subPointerIds]
  }
  return pointerIds
}

async function exportingPointerValues(item){
  if (!item.dataValues.value) {
    return {}
  }
  const value = Value.fromJSON(item.dataValues.value)
  const _getInlinesAsArray = getInlinesAsArray(value.document).map((n) => n.toJSON());
  const pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerExport");

  let results = {}
  for (const pointer of pointers){
    results[pointer.data.pointerId] = pointer;
  }
  return results
}

const BlockModel = (sequelize, DataTypes) => {
  var Block = sequelize.define('Block', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
    type: {
      type: DataTypes.ENUM('QUESTION', 'ANSWER', 'SCRATCHPAD'),
      allowNull: false
    },
    value: {
      type: DataTypes.JSON
    },
    cachedImportPointerIds: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    cachedExportPointerValues: {
      type: DataTypes.JSON
    },
  }, {
    hooks: {
      beforeValidate: async (item, options) => {
        eventHooks.beforeValidate(item, options);
        item.cachedExportPointerValues = await exportingPointerValues(item)
        item.cachedImportPointerIds = await importingPointerIds(item, sequelize)
      },
      beforeUpdate: (item, options) => {
        options.fields = item.changed();
      },
      afterSave: async (item, options) => {
        const exportingPointers = await item.getExportingPointers();
        const {cachedExportPointerValues, cachedImportPointerIds} = item;

        for (const pointerId of Object.keys(cachedExportPointerValues)) {
          if (!_.includes(exportingPointers.map(p => p.id), pointerId)){
            await item.createExportingPointer({id: pointerId}, {event: options.event})
          }
        }

        const workspace = await item.getWorkspace()
        workspace.updatePointerImports(cachedImportPointerIds, {event: options.event})
      }
    },
    getterMethods: {
        async recentBlockVersion() {
            const blockVersions = await this.getBlockVersion();
            return blockVersions[0]
        },
    }
  });
  Block.associate = function (models) {
    Block.Workspace = Block.belongsTo(models.Workspace, {foreignKey: 'workspaceId'})
    Block.ExportingPointers = Block.hasMany(models.Pointer, {as: 'exportingPointers', foreignKey: 'sourceBlockId'})
    addEventAssociations(Block, models)
  }
  return Block;
};

export default BlockModel;