'use strict';
import Sequelize from 'sequelize';
import addEvents from './addEvents.js';

const BlockModel = (sequelize, DataTypes) => {
  var Block = sequelize.define('Block', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...addEvents().eventRelationshipColumns(DataTypes),
    type: {
      type: DataTypes.ENUM('QUESTION', 'ANSWER', 'SCRATCHPAD'),
      allowNull: false
    },
    value: {
      type: DataTypes.JSON
    }
  }, {
    hooks: {
        ...addEvents().beforeValidate,
    },
    getterMethods: {
        async recentBlockVersion() {
            const blockVersions = await this.getBlockVersion();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            return blockVersions[0]
        },
    }
  });
  Block.associate = function (models) {
    Block.Workspace = Block.belongsTo(models.Workspace, {foreignKey: 'workspaceId'})
    addEvents().run(Block, models)
  }
  return Block;
};

export default BlockModel;