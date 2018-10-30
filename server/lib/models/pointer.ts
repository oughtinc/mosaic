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
          const sourceBlock = await sequelize.models.Block.findById(
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

  Pointer.prototype.containedPointers = async function() {
    const directPointers = await this.directContainedPointers();
    const allPointers: any = [...directPointers];
    for (const pointer of allPointers) {
      const directImports = await pointer.directContainedPointers();
      directImports
        .filter(p => !_.includes(allPointers.map(p => p.id), p.id))
        .forEach(p => {
          allPointers.push(p);
        });
    }
    return allPointers;
  };

  Pointer.prototype.newContainedPointers = async function(pointersSoFar) {
    const directPointers = await this.newDirectContainedPointers(pointersSoFar);
    const allPointers: any = [...directPointers];

    for (const pointer of allPointers) {
      const directImports = await pointer.newDirectContainedPointers(
        pointersSoFar
      );
      directImports
        .filter(p => !_.includes(allPointers.map(p => p.id), p.id))
        .forEach(p => {
          allPointers.push(p);
        });
    }
    return allPointers;
  };

  Pointer.prototype.directContainedPointers = async function() {
    const pointerIds = await this.directContainedPointerIds();
    const pointers = await sequelize.models.Pointer.findAll({
      where: {
        id: {
          [Op.in]: _.uniq(pointerIds)
        }
      }
    });
    return pointers;
  };

  Pointer.prototype.newDirectContainedPointers = async function(pointersSoFar) {
    const pointerIds = await this.newDirectContainedPointerIds(pointersSoFar);

    if (pointerIds.length === 0) return [];

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

  Pointer.prototype.newDirectContainedPointerIds = async function(
    pointersSoFar
  ) {
    const value = await this.value;
    if (!value) {
      return [];
    }

    const inlines = getAllInlinesAsArray(value);
    const pointerInlines = inlines.filter(l => !!l.data.pointerId);
    const pointerIds = pointerInlines.map(p => p.data.pointerId);

    const newPointerIds = pointerIds.filter(pointerId => {
      const alreadyListed = _.some(
        pointersSoFar,
        pointerSoFar => pointerSoFar.id === pointerId
      );
      return !alreadyListed;
    });

    return newPointerIds;
  };

  return Pointer;
};

export default PointerModel;
