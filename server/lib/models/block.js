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
        afterCreate: async (block, options) => {
          await block.createBlockVersion({value: {}})
        }
    },
    getterMethods: {
        async workspace() {
            const questionWorkspace = await this.getQuestionWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            const answerWorkspace = await this.getAnswerWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            const scratchpadWorkspace = await this.getScratchpadWorkspace();//sequelize.models.BlockVersion.findAll({where: {blockId: this.id}})
            return questionWorkspace || answerWorkspace || scratchpadWorkspace;
        }
    }
  });

  Block.associate = function (models) {
    Block.Transaction = Block.hasOne(models.Transaction, {as: 'transaction', foreignKey: "transactionId"})
    Block.BlockVersions = Block.hasMany(models.BlockVersion, {as: 'blockVersions', foreignKey: 'blockId'})
    Block.QuestionWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'questionId'})
    Block.AnswerWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'answerId'})
    Block.ScratchpadWorkspace = Block.hasOne(models.Workspace, {foreignKey: 'scratchpadId'})
    Block.Pointers = Block.hasMany(models.Pointer, {as: 'pointers', foreignKey: "sourceBlockId"})
  }

  const UPDATABLE_VALUES = ['value', 'cachedPointerValues', 'cachedOutputPointerValues']

  Block.prototype.recentBlockVersion = async function () {
    const _blockVersions = await sequelize.models.BlockSpace.findAll({
      limit: 1,
      where: {
        blockId: this.id,
      },
      order: [['createdAt', 'DESC']]
    })
    return _blockVersions[0]
  }

  Block.prototype.createBlockVersion = async function(_newInputs) {
    function findInputPointerIds(value) {
      return []
    }

    function findOutputPointerValues(value) {
      return {}
    }

    //TODO: Warning: This always finds the most recent input Pointer, which could break transactions.
    async function updateCachedInputPointerValues(value) {
      const inputPointerIds = findInputPointerIds(value)
      let pointerValues = {}
      for (inputPointerId of inputPointerIds) {
        const inputPointer = await sequelize.models.Pointer.findById(inputPointerId)
        const value = await inputPointer.getValue()
        pointerValues[inputPointerId] = value
      }

      return {deletedInputPointers, addedInputPointers}
    }

    async function updateCachedOutputPointerValues(value) {
      const outputPointerValues = findOutputPointerValues(value)
      // for (pointerId of Object.entries(outputPointerValues)){

      // }
      return {deletedOutputPointers, updatedOutputPointers, createdOutputPointers}
    }

    let newInputs = {..._newInputs}
    const recentBlockVersion = await this.recentBlockVersion()
    const previousValues = previousWorkspaceVersion.dataValues
    const newValue = {...previousValues, ...newInputs, blockId: this.id }

    const newBlockVersion = sequelize.models.BlockVersion.create(_.pick(newValue, UPDATABLE_VALUES))

    const {deletedImportPointers, addedImportPointers} = updateCachedInputPointerValues(newValue.value)

    return newBlockVersion
  }

  return Block;
};
