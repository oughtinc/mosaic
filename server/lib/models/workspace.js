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
    ...addEvents().eventRelationshipColumns(DataTypes),
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
        ...addEvents().beforeValidate,
        afterCreate: async (workspace, {event}) => {
          await workspace.createBlock({type: "QUESTION"}, {event})
          await workspace.createBlock({type: "ANSWER"}, {event})
          await workspace.createBlock({type: "SCRATCHPAD"}, {event})
        },
        afterUpdate: async (workspace, options) => {
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
    Workspace.ChildWorkspace = Workspace.hasOne(models.Workspace, { as: 'childWorkspace', foreignKey: 'parentId' })
    Workspace.Blocks = Workspace.hasMany(models.Block, { as: 'blocks', foreignKey: 'workspaceId' })
    addEvents().run(Workspace, models)
  }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceVersionIds, element]
  }

  Workspace.prototype.createChild = async function ({event}) {
    const child = await this.createChildWorkspace({}, {event})
    await this.update({
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    }, {event})
    return child
  }

  return Workspace;
};
