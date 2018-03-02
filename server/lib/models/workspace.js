'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
const addEvents = require('./addEvents.js');

module.exports = (sequelize, DataTypes) => {
  var Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    childWorkspaceOrder: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    hasBeenDeletedByAncestor: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false
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
        afterUpdate: async (workspace, options) => {
          console.log("HI!!!", workspace,  options)

          async function archiveRemovedChildren(previousChildWorkspaceOrder, newChildWorkspaceOrder) {
            let updatedWorkspaceVersionIds = {}
            if (newChildWorkspaceOrder) {
              const removedWorksaceId = _.difference(previousChildWorkspaceOrder, newChildWorkspaceOrder)
              for (workspaceId of removedWorksaceId) {
                const workspace = await sequelize.models.Workspace.findbyId(workspaceId)
                if (!workspace.isArchived) {
                  const workspaceVersion = await workspace.createWorkspaceVersion({ isArchived: true })
                  updatedWorkspaceVersionIds[workspace.id] = workspaceVersion.id
                }
              }
            }
            return updatedWorkspaceVersionIds
          }

          function combineChildWorkspaceVersionIds(previousValues, newInputs = {}, updatedWorkspaceVersionIdsFromDeletions) {
            return { ...previousValues.childWorkspaceVersionIds, ...newInputs.updateChildWorkspaceVersionIds, ...updatedWorkspaceVersionIdsFromDeletions }
          }

          async function newChildWorkspaceVersionIds(previousValues, newInputs) {
            const updatedWorkspaceVersionIdsFromDeletions = await archiveRemovedChildren(previousValues.childWorkspaceOrder, newInputs.childWorkspaceOrder)
            return combineChildWorkspaceVersionIds(previousValues, newInputs = {}, updatedWorkspaceVersionIdsFromDeletions)
          }

          async function updateParent(workspace, newWorkspaceVersionId) {
            if (!!workspace.parentId) {
              const parent = await workspace.getParentWorkspace();
              await parent.createWorkspaceVersion({ childrenWorkspaceVersionIds: { [workspace.id]: newWorkspaceVersionId } })
            }
          }

          await archiveRemovedChildren(previousValues.childWorkspaceOrder, newInputs.childWorkspaceOrder)

          await updateParent(workspace, newWorkspaceVersion.id)
        }
      }
    });
  Workspace.associate = function (models) {
    Workspace.QuestionBlock = Workspace.belongsTo(models.Block, { as: 'questionBlock', foreignKey: 'questionId' })
    Workspace.Blocks = Workspace.hasMany(models.Block, { as: 'blocks', foreignKey: 'workspaceId' })
    Workspace.ChildWorkspace = Workspace.hasOne(models.Workspace, { as: 'childWorkspace', foreignKey: 'parentId' })
    addEvents().run(Workspace, models)
  }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceVersionIds, element]
  }

  Workspace.prototype.createChild = async function () {
    const child = await this.createChildWorkspace()
    const childVersion = await child.recentWorkspaceVersion()
    await this.update({
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    })
    return child
  }

  return Workspace;
};
