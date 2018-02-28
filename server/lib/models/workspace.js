'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
  }, {
      hooks: {
        beforeCreate: async (workspace, options) => {
          const question = await sequelize.models.Block.create();
          const answer = await sequelize.models.Block.create();
          const scratchpad = await sequelize.models.Block.create();
          workspace.questionId = question.id;
          workspace.answerId = answer.id;
          workspace.scratchpadId = scratchpad.id;
        },
        afterCreate: async (workspace, options) => {
          const question = await workspace.getQuestionBlock();
          const answer = await workspace.getAnswerBlock();
          const scratchpad = await workspace.getScratchpadBlock();

          const questionVersion = await sequelize.models.BlockVersion.create({ blockId: question.id, value: {} });
          const answerVersion = await sequelize.models.BlockVersion.create({ blockId: answer.id, value: {} });
          const scratchpadVersion = await sequelize.models.BlockVersion.create({ blockId: scratchpad.id, value: {} });

          const workspacePointersCollectionVersion = await sequelize.models.WorkspacePointersCollectionVersion.create({
            workspaceId: workspace.id
          });

          const workspaceVersion = await sequelize.models.WorkspaceVersion.create({
            workspaceId: workspace.id,
            questionVersionId: questionVersion.id,
            answerVersionId: answerVersion.id,
            scratchpadVersionId: scratchpadVersion.id,
            workspacePointersCollectionVersionId: workspacePointersCollectionVersion.id
          });
        }
      }
    });
  Workspace.associate = function (models) {
    Workspace.Transaction = Workspace.hasOne(models.Transaction, {as: 'transaction', foreignKey: "transactionId"})
    Workspace.WorkspaceVersions = Workspace.hasMany(models.WorkspaceVersion, { as: 'workspaceVersions', foreignKey: 'workspaceId' })
    Workspace.QuestionBlock = Workspace.belongsTo(models.Block, { as: 'questionBlock', foreignKey: 'questionId' })
    Workspace.AnswerBlock = Workspace.belongsTo(models.Block, { as: 'answerBlock', foreignKey: 'answerId' })
    Workspace.ScratchpadBlock = Workspace.belongsTo(models.Block, { as: 'scratchpadBlock', foreignKey: 'scratchpadId' })
    Workspace.ParentWorkspace = Workspace.belongsTo(models.Workspace, { as: 'parentWorkspace', foreignKey: 'parentId' })
    Workspace.ChildWorkspace = Workspace.hasOne(models.Workspace, { as: 'childWorkspace', foreignKey: 'parentId' })
    Workspace.WorkspacePointerCollectionVersions = Workspace.hasMany(models.WorkspacePointerCollectionVersion, { as: 'workspacePointerCollectionVersions', foreignKey: 'workspaceId' })
  }

  Workspace.prototype.recentWorkspaceVersion = async function () {
    const workspaceVersion = await sequelize.models.WorkspaceVersion.findAll({
      limit: 1,
      where: {
        workspaceId: this.id,
      },
      order: [['createdAt', 'DESC']]
    })
    return workspaceVersion[0]
  }

  const UPDATABLE_VALUES = ['isArchived', 'childWorkspaceOrder', 'childWorkspaceVersionIds', 'questionVersionId', 'answerVersionId', 'scratchpadVersionId', 'workspaceId']

  Workspace.prototype.createWorkspaceVersion = async function (_newInputs) {
    //Private functions
    async function archiveRemovedChildren(previousChildWorkspaceOrder, newChildWorkspaceOrder) {
      let updatedWorkspaceVersionIds = {}
      if (newChildWorkspaceOrder) {
        const removedWorksaceId = _.difference(previousChildWorkspaceOrder, newChildWorkspaceOrder)
        for (workspaceId of removedWorksaceId) {
          const workspace = await sequelize.models.Workspace.findbyId(workspaceId)
          if (!workspace.isArchived) {
            const workspaceVersion = await workspace.createWorkspaceVersion({isArchived: true})
            updatedWorkspaceVersionIds[workspace.id] = workspaceVersion.id
          }
        }
      }
      return updatedWorkspaceVersionIds
    }

    function combineChildWorkspaceVersionIds(previousValues, newInputs = {}, updatedWorkspaceVersionIdsFromDeletions) {
      return {...previousValues.childWorkspaceVersionIds, ...newInputs.updateChildWorkspaceVersionIds, ...updatedWorkspaceVersionIdsFromDeletions}
    }

    async function newChildWorkspaceVersionIds(previousValues, newInputs) {
      const updatedWorkspaceVersionIdsFromDeletions = await archiveRemovedChildren(previousValues.childWorkspaceOrder, newInputs.childWorkspaceOrder)
      return combineChildWorkspaceVersionIds(previousValues, newInputs = {}, updatedWorkspaceVersionIdsFromDeletions)
    } 

    async function updateParent(workspace, newWorkspaceVersionId) {
      if (!!workspace.parentId) {
        const parent = await workspace.getParentWorkspace();
        await parent.createWorkspaceVersion({childrenWorkspaceVersionIds: {[workspace.id]: newWorkspaceVersionId}})
      }
    }

    let newInputs = {..._newInputs}
    const previousWorkspaceVersion = await this.recentWorkspaceVersion()
    const previousValues = previousWorkspaceVersion.dataValues

    newInputs.childWorkspaceVersionIds = await newChildWorkspaceVersionIds(previousValues, newInputs)
    const newValue = {...previousValues, ...newInputs, workspaceId: this.id };
    const newWorkspaceVersion = sequelize.models.WorkspaceVersion.create(_.pick(newValue, UPDATABLE_VALUES))
    await updateParent(this, newWorkspaceVersion.id)
    return newWorkspaceVersion
  }

  Workspace.prototype.updateIsArchivedCache = async function () {
    const recentVersion = await this.recentWorkspaceVersion();
    const parent = this.ParentWorkspace
  }

  Workspace.prototype.getBlocks = async function () {
    const questionBlock = await this.getQuestionBlock();
    const answerBlock = await this.getAnswerBlock();
    const scratchpadBlock = await this.getScratchpadBlock();
    return [questionBlock, answerBlock, scratchpadBlock]
  }

  Workspace.prototype.getBlockVersions = async function () {
    const recentVersion = await this.recentWorkspaceVersion();
    return await recentVersion.getBlockVersions();
  }

  Workspace.prototype.getWorkspacePointersCollectionVersion = async function () {
    const recentVersion = await this.recentWorkspaceVersion();
  }

  Workspace.prototype.updateBlockVersions = async function (blockVersions) {
    const newTransaction = await sequelize.models.Transaction.create();

    const recentWorkspaceVersion = await this.recentWorkspaceVersion()
    if (false) {
      throw new Error("Multiple BlockVersions for same blockID")
    }
    //These should really be validations.
    if (false) {
      throw new Error("Referenced blockId does not exist on referenced workspace.")
    }
    let newInputs = {};
    for (const blockVersionData of blockVersions) {
      if (this.questionId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["questionVersionId"] = blockVersion.id
      }
      if (this.answerId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["answerVersionId"] = blockVersion.id
      }
      if (this.scratchpadId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["scratchpadVersionId"] = blockVersion.id
      }
    }

    //1: Find all new or modified output Pointers from changed blockVersions
    //2: Find all of the new input Pointers Values, given the recent changes that have yet to save.
    //3: Make new BlockVersions with these inputs & outputs. When you save, if there are any altered or removed outputs, XXXX.
    //4: Make a list of all pointerInputVersions that will need to be created given the new inputs.
    // const workspacePointerCollectionVersion = await this.createWorkspacePointerCollectionVersion({newInputPointers, newOutputPointers})
    // const newWorkspaceVersion = await this.createWorkspaceVersion(newInputs)
  }

  // Workspace.prototype.updateBlockVersions = async function (blockVersions) {
  //   for (blockVersion of blockVersions){
  //     updateCachedInputs(blockVersion) // BlockVersions should change, but nothing else should change.
  //   }
  // }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceVersionIds, element]
  }


  Workspace.prototype.updatePointersCollection = async function (transaction, modifiedExportedPointerIds) {
    const newPointerCollectionVersion = await this.createWorkspacePointerCollectionVersion({transactionId: transaction.id})
  }

  Workspace.prototype.createChild = async function () {
    const child = await this.createChildWorkspace()
    const childVersion = await child.recentWorkspaceVersion()
    this.createWorkspaceVersion({
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
      updateChildWorkspaceVersionIds: {[child.id]: childVersoin.id}
    })
    return child
  }

  return Workspace;
};
