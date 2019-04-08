import * as Sequelize from "sequelize";
import { diff } from "deep-object-diff";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";
import { getAllInlinesAsArray } from "../utils/slateUtils";
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
        allowNull: false,
      },
      ...eventRelationshipColumns(DataTypes),
      type: {
        type: DataTypes.ENUM(
          "QUESTION",
          "ANSWER",
          "SCRATCHPAD",
          "SUBQUESTION_DRAFT",
          "ANSWER_DRAFT"
        ),
        allowNull: false,
      },
      value: {
        type: DataTypes.JSON,
      },
      cachedExportPointerValues: {
        type: DataTypes.JSON,
      },
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
          await item.ensureAllPointersAreInDatabase({ event: options.event, models: sequelize.models });
          if (item._previousDataValues) {
            const changes = diff(item._previousDataValues, item.dataValues);
            if (!_.isEmpty(changes.value)) {
              await item.updateStalenessAndIsCurrentlyResolved({ event: options.event });
            }
          }
        }
      }
    }
  );

  Block.associate = function(models: any) {
    Block.Workspace = Block.belongsTo(models.Workspace, {
      foreignKey: "workspaceId",
    });
    Block.ExportingPointers = Block.hasMany(models.Pointer, {
      as: "exportingPointers",
      foreignKey: "sourceBlockId",
    });
    addEventAssociations(Block, models);
  };

  Block.prototype.ensureAllPointersAreInDatabase = async function({ event, models }) {
    const exportingPointers = await this.getExportingPointers();
    const { cachedExportPointerValues } = this;

    for (const pointerId of Object.keys(cachedExportPointerValues)) {
      if (!_.includes(exportingPointers.map(p => p.id), pointerId)) {
        const pointer = await models.Pointer.findByPk(pointerId);
        if (!pointer) {
          await this.createExportingPointer({ id: pointerId }, { event });
        } else {
          // if the pointer already exists,
          // then it was present in the subquestion draft block,
          // and we need to "move" it to the newly created question block
          pointer.update({ sourceBlockId: this.id })
        }
      }
    }
  };

  Block.prototype.updateStalenessAndIsCurrentlyResolved = async function({ event }) {
    const workspaceId = this.workspaceId;
    const workspace = await sequelize.models.Workspace.findByPk(workspaceId);

    // If block is a question
    if (this.type === QUESTION_TYPE) {

      // If it's marked as resolved, then it's going to transition from
      // from resolved to unresolved, so let's take a snapshot of the draft as the answer
      if (workspace.isCurrentlyResolved) {
        const blocks = await workspace.getBlocks();
        const answerDraft = blocks.find(
          b => b.type === "ANSWER_DRAFT"
        );
        const answer = blocks.find(
          b => b.type === "ANSWER"
        );

        await answer.update({ value: answerDraft.value });
      }

      // Mark workspace as stale
      // If it's currently marked as resolved, that it isn't anymore
      return workspace.update({ 
        isCurrentlyResolved: false,
        isStale: true,
        isNotStaleRelativeToUser: [],
      }, { event });
    }
  };

  Block.prototype.connectedPointers = async function({ pointersSoFar } = {}) {
    let pointers = await this.topLevelPointers({ pointersSoFar });
    if (pointersSoFar) {
      pointers = _.differenceBy(pointers, pointersSoFar, "id");
    }

    let allPointers = [...pointers];
    for (const pointer of pointers) {
      const subPointers = await pointer.containedPointers({
        pointersSoFar: _.unionBy(pointersSoFar, allPointers, "id"),
      });
      allPointers = [...allPointers, ...subPointers];
    }
    return _.uniqBy(allPointers, "id");
  };

  // private
  Block.prototype.topLevelPointers = async function({ pointersSoFar } = {}) {
    let topLevelPointerIds = await this.topLevelPointersIds();
    if (pointersSoFar) {
      topLevelPointerIds = _.difference(
        topLevelPointerIds,
        _.map(pointersSoFar, _.property("id"))
      );
    }

    const pointers: any = [];
    for (const id of topLevelPointerIds) {
      const pointer = await sequelize.models.Pointer.findByPk(id);
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
  Block.prototype.exportingPointerValues = async function(models) {
    if (!this.dataValues.value) {
      return {};
    }

    const _getInlinesAsArray = getAllInlinesAsArray(this.dataValues.value);
    const pointers = _getInlinesAsArray.filter(l => l.type === "pointerExport");

    const results = {};
    for (const pointerJSON of pointers) {
      results[pointerJSON.data.pointerId] = pointerJSON;

      const pointer = await sequelize.models.Pointer.findByPk(
        pointerJSON.data.pointerId
      );

      if (pointer) {
        await pointer.update({ cachedValue: pointerJSON });
      }
    }
    return results;
  };

  return Block;
};

export default BlockModel;
