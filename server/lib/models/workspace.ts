'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';
const Op = Sequelize.Op;

const WorkspaceModel = (sequelize, DataTypes) => {
  var Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
    childWorkspaceOrder: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    hasBeenDeletedByAncestor: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false
    },
    connectedPointers: {
      type: Sequelize.VIRTUAL(Sequelize.ARRAY(Sequelize.JSON), ['id']), 
      get: async function() {
        const _connectedPointers = await this.getConnectedPointers();
        let values:any = []
        for (const pointer of _connectedPointers){
          const value = await pointer.value
          values.push(value)
        }
        return values.filter(v => !!v)
      }
    },
  }, {
      hooks: {
        ...eventHooks.beforeValidate,
        afterCreate: async (workspace, {event, questionValue}) => {
          const blocks = await workspace.getBlocks();
          if (questionValue) {
            await workspace.createBlock({type: "QUESTION", value: questionValue}, {event})
          } else {
            await workspace.createBlock({type: "QUESTION"}, {event})
          }
          await workspace.createBlock({type: "SCRATCHPAD"}, {event})
          await workspace.createBlock({type: "ANSWER"}, {event})
        },
      }
    });
  Workspace.associate = function (models) {
    Workspace.ChildWorkspaces = Workspace.hasMany(models.Workspace, { as: 'childWorkspaces', foreignKey: 'parentId' })
    Workspace.PointerImports = Workspace.hasMany(models.PointerImport, { as: 'pointerImports', foreignKey: 'workspaceId' })
    Workspace.ParentWorkspace = Workspace.belongsTo(models.Workspace, { as: 'parentWorkspace', foreignKey: 'parentId' })
    Workspace.Blocks = Workspace.hasMany(models.Block, { as: 'blocks', foreignKey: 'workspaceId' })
    addEventAssociations(Workspace, models)
  }

  Workspace.createAsChild = async function ({parentId, question}, {event}) {
    const _workspace = await sequelize.models.Workspace.create({parentId}, {event, questionValue:question})
    return _workspace
  }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceOrder, element]
  }

  //obsolete?
  Workspace.prototype.updatePointerImports = async function (pointerIds, {event}) {
    const pointerImports = await this.getPointerImports()
    for (const pointerId of _.uniq(pointerIds)){
      if (!_.includes(pointerImports.map(p => p.pointerId), pointerId)){
        const pointer = await sequelize.models.Pointer.findById(pointerId);
        if (!pointer) {
          console.error ("The relevant pointer for pointer import ", pointerId, " does not exist.")
        } else {
          await this.createPointerImport({pointerId}, {event})
        }
      }
    }
  }

  Workspace.prototype.createChild = async function ({event, question}) {
    const child = await sequelize.models.Workspace.createAsChild({parentId: this.id, question}, {event})
    await this.update({
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    }, {event})
    return child
  }

  //private
  Workspace.prototype.getConnectedPointers = async function () {
    const blocks = await this.visibleBlocks()
    let _connectedPointers: string[] = []
    for (const block of blocks){
      const blockPointerIds = await block.connectedPointers()
      _connectedPointers = [..._connectedPointers, ...blockPointerIds]
    }

    return _connectedPointers
  }

  //private
  Workspace.prototype.visibleBlocks = async function () {
    let blocks = await this.getBlocks();
    const connectingChildBlocks = await sequelize.models.Block.findAll({
      where: {
        workspaceId: {
          [Op.in]: this.childWorkspaceOrder,
        },
        type: {
          [Op.in]: ["QUESTION", "ANSWER"],
        }
      }
    })
    blocks = [...blocks, ...connectingChildBlocks]
    return blocks
  }

  return Workspace;
};

export default WorkspaceModel;