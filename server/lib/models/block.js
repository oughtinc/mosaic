'use strict';
const Sequelize = require('sequelize')
const addEvents = require('./addEvents.js');

module.exports = (sequelize, DataTypes) => {
  var Block = sequelize.define('Block', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('QUESTION', 'ANSWER', 'SCRATCHPAD'),
      allowNull: false
    },
    value: {
      type: DataTypes.JSON
    }
  }, {
    hooks: {
        // afterCreate: async (block, options) => {
        //   await block.createBlockVersion({value: {}})
        // }
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