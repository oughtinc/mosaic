import Sequelize from 'sequelize';
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';
import _ = require('lodash');
const Op = Sequelize.Op;

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
    addEventAssociations(Pointer, models)
  }

  Pointer.prototype.containedPointers = async function(sequelize) {
    const directPointers = await this.directContainedPointers(sequelize)
    let allPointers:any = [...directPointers]
    for (const pointer of allPointers) {
      const directImports = await pointer.directContainedPointers(sequelize);
      directImports.filter(p => !_.includes(allPointers.map(p => p.id), p.id)).forEach(p => {
        allPointers.push(p)
      })
    }
    return allPointers
  }

  Pointer.prototype.directContainedPointers = async function(sequelize) {
    const value = await this.value
    if (!value) { return [] }
    const inlines =  getInlinesAsArray(value)
    const pointerInlines =  inlines.filter((l) => !!l.data.pointerId)
    const pointerIds = pointerInlines.map(p => p.data.pointerId)
    if (pointerIds.length === 0) { return [] }
    const pointers = await sequelize.models.Pointer.findAll({
      where: {
        id: {
          [Op.or]: _.uniq(pointerIds),
        }
      }
    })
    return pointers
  }

  return Pointer
};

export default PointerModel;