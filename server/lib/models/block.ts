import * as Sequelize from "sequelize";
import { diff } from "deep-object-diff";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations
} from "../eventIntegration";
import { getAllInlinesAsArray } from "../utils/slateUtils";
import { Value } from "slate";
import * as _ from "lodash";

const QUESTION_TYPE = "QUESTION"; // move elsewhere?
const ANSWER_TYPE = "ANSWER";
const SCRATCHPAD_TYPE = "SCRATCHPAD";

const BlockModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Block = sequelize.define(
    "Block",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      ...eventRelationshipColumns(DataTypes),
      type: {
        type: DataTypes.ENUM(QUESTION_TYPE, ANSWER_TYPE, SCRATCHPAD_TYPE),
        allowNull: false
      },
      value: {
        type: DataTypes.JSON
      },
      cachedExportPointerValues: {
        type: DataTypes.JSON
      }
    },
    {
      hooks: {
        beforeValidate: async (item: any, options: any) => {
          eventHooks.beforeValidate(item, options);
          item.cachedExportPointerValues = await item.exportingPointerValues();
        },
        beforeUpdate: (item: any, options: any) => {
          options.fields = item.changed();
        },
        afterSave: async (item: any, options: any) => {
          await item.ensureAllPointersAreInDatabase({ event: options.event });
          if (item._previousDataValues) {
            const changes = diff(item._previousDataValues, item.dataValues);
            if (!_.isEmpty(changes.value)) {
              // The content of the block changed, so we need to mark any
              // workspaces that contain the block as stale.
              await item.propagateStaleness({ event: options.event });
            }
          }
        }
      }
    }
  );

  Block.associate = function(models: any) {
    Block.Workspace = Block.belongsTo(models.Workspace, {
      foreignKey: "workspaceId"
    });
    Block.ExportingPointers = Block.hasMany(models.Pointer, {
      as: "exportingPointers",
      foreignKey: "sourceBlockId"
    });
    addEventAssociations(Block, models);
  };

  Block.prototype.ensureAllPointersAreInDatabase = async function({ event }) {
    const exportingPointers = await this.getExportingPointers();
    const { cachedExportPointerValues } = this;

    for (const pointerId of Object.keys(cachedExportPointerValues)) {
      if (!_.includes(exportingPointers.map(p => p.id), pointerId)) {
        await this.createExportingPointer({ id: pointerId }, { event });
      }
    }
  };

  Block.prototype.propagateStaleness = async function({ event }) {
    console.log("propagateStaleness");
    console.log(this.type);
    const workspaceId = this.workspaceId;
    const workspace = await sequelize.models.Workspace.findById(workspaceId);
    // 1. If block is a question, mark workspace it belongs to as stale
    if (this.type === QUESTION_TYPE) {
      return workspace.update({ isStale: true }, { event });
    }
    // 2. If block is an answer, mark parent as stale (if there is a parent)
    if (this.type === ANSWER_TYPE && workspace.parentId) {
      const parentId = workspace.parentId;
      const parentWorkspace = await sequelize.models.Workspace.findById(
        parentId
      );
      return parentWorkspace.update({ isStale: true }, { event });
    }
    // 3. TODO If edit was to a pointer exported within this block, mark all
    //    workspaces that import and expand that pointer as stale.
  };

  Block.prototype.connectedPointers = async function() {
    const pointers = await this.topLevelPointers();

    let allPointers = [...pointers];
    for (const pointer of pointers) {
      const subPointers = await pointer.containedPointers();
      allPointers = [...allPointers, ...subPointers];
    }
    return _.uniqBy(allPointers, "id");
  };

  Block.prototype.newConnectedPointers = async function(pointersSoFar) {
    const pointers = await this.newTopLevelPointers(pointersSoFar);

    let allPointers = [...pointers];

    for (const pointer of pointers) {
      const subPointers = await pointer.newContainedPointers([
        ...allPointers,
        ...pointersSoFar
      ]);
      allPointers = [...allPointers, ...subPointers];
    }
    return _.uniqBy(allPointers, "id");
  };

  // private
  Block.prototype.topLevelPointers = async function() {
    const topLevelPointerIds = await this.topLevelPointersIds();
    const pointers: any = [];
    for (const id of topLevelPointerIds) {
      const pointer = await sequelize.models.Pointer.findById(id);
      if (!!pointer) {
        pointers.push(pointer);
      } else {
        console.error(
          `Referenced pointer with ID ${id} not found in database.`
        );
      }
    }
    return _.uniqBy(pointers, "id");
  };

  Block.prototype.newTopLevelPointers = async function(pointersSoFar) {
    const topLevelPointerIds = await this.topLevelPointersIds();
    const newTopLevelPointerIds = topLevelPointerIds.filter(pointerId => {
      const alreadyListed = _.some(
        pointersSoFar,
        pointerSoFar => pointerSoFar.id === pointerId
      );
      return !alreadyListed;
    });

    const pointers: any = [];
    for (const id of newTopLevelPointerIds) {
      const pointer = await sequelize.models.Pointer.findById(id);
      if (!!pointer) {
        pointers.push(pointer);
      } else {
        console.error(
          `Referenced pointer with ID ${id} not found in database.`
        );
      }
    }
    return _.uniqBy(pointers, "id");
  };

  // private
  Block.prototype.topLevelPointersIds = async function() {
    if (!this.dataValues.value) {
      return [];
    }
    const _getInlinesAsArray = getAllInlinesAsArray(this.dataValues.value);
    const pointers = _getInlinesAsArray.filter(
      l => l.type === "pointerImport" || l.type === "pointerExport"
    );
    return pointers.map(p => p.data.pointerId);
  };

  // private
  Block.prototype.exportingPointerValues = async function() {
    if (!this.dataValues.value) {
      return {};
    }

    const _getInlinesAsArray = getAllInlinesAsArray(this.dataValues.value);
    const pointers = _getInlinesAsArray.filter(l => l.type === "pointerExport");

    const results = {};
    for (const pointer of pointers) {
      results[pointer.data.pointerId] = pointer;
    }
    return results;
  };

  return Block;
};

export default BlockModel;
