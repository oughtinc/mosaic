'use strict';
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  var Block = sequelize.define('Block', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
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
        async workspace() {
            const questionWorkspace = await this.getQuestionWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            const answerWorkspace = await this.getAnswerWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            const scratchpadWorkspace = await this.getScratchpadWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            return questionWorkspace || answerWorkspace || scratchpadWorkspace;
        }
    }
  });
  Block.associate = function (models) {
    Block.BlockVersions = Block.hasMany(models.BlockVersion, {foreignKey: 'blockId'})
    Block.QuestionWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'questionId'})
    Block.AnswerWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'answerId'})
    Block.ScratchpadWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'scratchpadId'})
  }
  return Block;
};