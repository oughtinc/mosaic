import Sequelize from 'sequelize';
import { eventRelationshipColumns, eventHooks, addEventAssociations } from '../eventIntegration';
import { Value } from "slate"
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
    cachedExportPointerValues: {
      type: DataTypes.JSON
    },
  }, {
      hooks: {
        beforeValidate: async (item, options) => {
          eventHooks.beforeValidate(item, options);
          item.cachedExportPointerValues = await item.exportingPointerValues()
        },
        beforeUpdate: (item, options) => {
          options.fields = item.changed();
        },
        afterSave: async (item, options) => {
          await item.ensureAllPointersAreInDatabase({ event: options.event })
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
    Block.Workspace = Block.belongsTo(models.Workspace, { foreignKey: 'workspaceId' })
    Block.ExportingPointers = Block.hasMany(models.Pointer, { as: 'exportingPointers', foreignKey: 'sourceBlockId' })
    addEventAssociations(Block, models)
  }

  Block.prototype.ensureAllPointersAreInDatabase = async function ({ event }) {
    const exportingPointers = await this.getExportingPointers();
    const { cachedExportPointerValues } = this;

    for (const pointerId of Object.keys(cachedExportPointerValues)) {
      if (!_.includes(exportingPointers.map(p => p.id), pointerId)) {
        await this.createExportingPointer({ id: pointerId }, { event })
      }
    }
  }

  Block.prototype.connectedPointerIds = async function () {
    const pointers = await this.topLevelPointers()
    let pointerIds = pointers.map(p => p.id);
    for (const pointer of pointers) {
      const subPointerIds = await pointer.containedPointerIds(sequelize);
      pointerIds = [...pointerIds, ...subPointerIds]
    }
    return _.uniq(pointerIds)
  }

  //private
  Block.prototype.topLevelPointers = async function () {
    const topLevelPointerIds = await this.topLevelPointersIds()
    let pointers: any = []
    for (const id of topLevelPointerIds) {
      const pointer = await sequelize.models.Pointer.findById(id)
      console.log("FOUND POINTER?", pointer)
      pointers.push(pointer)
    }
    console.log(topLevelPointerIds, pointers)
    return pointers
  }

  //private
  Block.prototype.topLevelPointersIds = async function () {
    if (!this.dataValues.value) { return [] }
    const value = Value.fromJSON(this.dataValues.value)
    const _getInlinesAsArray = getInlinesAsArray(value.document).map((n) => n.toJSON());
    let pointers = _getInlinesAsArray.filter((l) => l.type === "pointerImport" || l.type === "pointerExport");
    return pointers.map(p => p.data.pointerId)
  }

  //private
  Block.prototype.exportingPointerValues = async function () {
    if (!this.dataValues.value) {
      return {}
    }
    const value = Value.fromJSON(this.dataValues.value)
    const _getInlinesAsArray = getInlinesAsArray(value.document).map((n) => n.toJSON());
    const pointers = _getInlinesAsArray.filter((l) => l.type === "pointerExport");

    let results = {}
    for (const pointer of pointers) {
      results[pointer.data.pointerId] = pointer;
    }
    return results
  }

  return Block;
};

export default BlockModel;