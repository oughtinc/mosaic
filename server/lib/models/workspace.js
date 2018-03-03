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
          await workspace.createBlock({type: "ANSWER"}, {event})
          await workspace.createBlock({type: "SCRATCHPAD"}, {event})
        },
      }
    });
  Workspace.associate = function (models) {
    Workspace.ChildWorkspaces = Workspace.hasMany(models.Workspace, { as: 'childWorkspaces', foreignKey: 'parentId' })
    Workspace.ParentWorkspace = Workspace.belongsTo(models.Workspace, { as: 'parentWorkspace', foreignKey: 'parentId' })
    Workspace.Blocks = Workspace.hasMany(models.Block, { as: 'blocks', foreignKey: 'workspaceId' })
    addEvents().run(Workspace, models)
  }

  Workspace.createAsChild = async function ({parentId, question}, {event}) {
    const _workspace = await sequelize.models.Workspace.create({parentId}, {event})
    await _workspace.createBlock({type: "QUESTION", value: question}, {event})
    return _workspace
  }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceOrder, element]
  }

  Workspace.prototype.createChild = async function ({event, question}) {
    const child = await sequelize.models.Workspace.createAsChild({parentId: this.id, question}, {event})
    await this.update({
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    }, {event})
    return child
  }

  return Workspace;
};
