import Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations
} from "../eventIntegration";
import { getAllInlinesAsArray } from "../utils/slateUtils";
import * as _ from "lodash";
const Op = Sequelize.Op;

const PointerModel = (sequelize, DataTypes) => {
  const Pointer = sequelize.define(
    "Pointer",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      ...eventRelationshipColumns(DataTypes),
      value: {
        type: Sequelize.VIRTUAL(Sequelize.JSON, ["id", "sourceBlockId"]),
        get: async function() {
          if (this.cachedValue !== null) {
            return this.cachedValue;
          }

          // look into removing the rest of this method
          // and related code (pulling in "id" and "sourceBlockId" attributes)
          // as well as the Block cachedExportPointerValues
          const pointerId = this.get("id");
          const sourceBlockId = this.get("sourceBlockId");
          const sourceBlock = await sequelize.models.Block.findByPk(
            sourceBlockId
          );
          const { cachedExportPointerValues } = sourceBlock;
          return cachedExportPointerValues[pointerId];
        }
      },
      cachedValue: {
        type: DataTypes.JSON
      }
    },
    {
      hooks: {
        beforeValidate: eventHooks.beforeValidate
      }
    }
  );

  Pointer.associate = function(models: any) {
    Pointer.SourceBlock = Pointer.belongsTo(models.Block, {
      as: "sourceBlock",
      foreignKey: "sourceBlockId"
    });
    addEventAssociations(Pointer, models);
  };

  Pointer.prototype.containedPointers = async function({ pointersSoFar } = {}) {
    const directPointers = await this.directContainedPointers({ pointersSoFar });
    const allPointers: any = [...directPointers];
    for (const pointer of allPointers) {
      const directImports = await pointer.directContainedPointers({ pointersSoFar: _.join(allPointers, pointersSoFar) });
      directImports
        .filter(p => !_.includes(allPointers.map(p => p.id), p.id))
        .forEach(p => {
          allPointers.push(p);
        });
    }
    return allPointers;
  };

  Pointer.prototype.directContainedPointers = async function({ pointersSoFar } = {}) {
    let pointerIds = await this.directContainedPointerIds();
    if (pointersSoFar) {
      pointerIds = _.difference(
        pointerIds,
        _.map(pointersSoFar, _.property("id"))
      );
    }

    const pointers = await sequelize.models.Pointer.findAll({
      where: {
        id: {
          [Op.in]: _.uniq(pointerIds)
        }
      }
    });
    return pointers;
  };

  Pointer.prototype.directContainedPointerIds = async function() {
    const value = await this.value;
    if (!value) {
      return [];
    }

    const inlines = getAllInlinesAsArray(value);
    const pointerInlines = inlines.filter(l => !!l.data.pointerId);
    const pointerIds = pointerInlines.map(p => p.data.pointerId);
    return pointerIds;
  };

  return Pointer;
};

export default PointerModel;
