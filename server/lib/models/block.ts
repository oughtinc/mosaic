import Sequelize from 'sequelize';
import { eventRelationshipColumns, eventHooks, addEventAssociations } from '../eventIntegration';
import { Value } from "slate"
import _ = require('lodash');
import { findInlinesFromDocument, SlateNode, POINTER_EXPORT } from '../helpers/slateParser';

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

  Block.prototype.connectedPointers = async function () {
    const pointers = await this.topLevelPointers()

    let allPointers = [...pointers];
    for (const pointer of pointers) {
      const subPointers = await pointer.containedPointers();
      allPointers = [...allPointers, ...subPointers]
    }
    return _.uniqBy(pointers, 'id')
  }

  //private
  Block.prototype.topLevelPointers = async function () {
    const topLevelPointerIds = await this.topLevelPointersIds()
    let pointers: any = []
    for (const id of topLevelPointerIds) {
      const pointer = await sequelize.models.Pointer.findById(id)
      pointers.push(pointer)
    }
    return _.uniqBy(pointers, 'id')
  }

  //private
  Block.prototype.topLevelPointersIds = async function () {
    return SlateNode.fromSlateValue(this.dataValues.value).pointerIds()
  }

  //private
  Block.prototype.exportingPointerValues = async function () {
    return SlateNode.fromSlateValue(this.dataValues.value).pointersById([POINTER_EXPORT])
  }

  return Block;
};

export default BlockModel;