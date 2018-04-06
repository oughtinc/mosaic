'use strict';
const Sequelize = require('sequelize')
import { eventRelationshipColumns, eventHooks, addEventAssociations } from '../eventIntegration';
const Op = Sequelize.Op;
import * as _ from "lodash";
import { concernFromJSON } from '../workspaceConcerns';

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
    totalBudget: {
      type: DataTypes.INTEGER(),
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    allocatedBudget: {
      type: DataTypes.INTEGER(),
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    remainingBudget: {
      type: Sequelize.VIRTUAL(Sequelize.INTEGER, ['totalBudget', 'allocatedBudget']),
      get: function() {
        return this.get('totalBudget') - this.get('allocatedBudget');
      }
    },
    connectedPointers: {
      type: Sequelize.VIRTUAL(Sequelize.ARRAY(Sequelize.JSON), ['id']),
      get: async function () {
        const _connectedPointers = await this.getConnectedPointers();
        let values: any = []
        for (const pointer of _connectedPointers) {
          const value = await pointer.value
          if (value) {
            values.push(value)
          } else {
            console.error(`Error: Value for pointer with id ${pointer.id} was not found in its respecting block.`)
          }
        }
        return values.filter(v => !!v)
      }
    },
  }, {
      hooks: {
        ...eventHooks.beforeValidate,
        afterCreate: async (workspace, { event, questionValue }) => {
          const blocks = await workspace.getBlocks();
          if (questionValue) {
            await workspace.createBlock({ type: "QUESTION", value: questionValue }, { event })
          } else {
            await workspace.createBlock({ type: "QUESTION" }, { event })
          }
          await workspace.createBlock({ type: "SCRATCHPAD" }, { event })
          await workspace.createBlock({ type: "ANSWER" }, { event })
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

  Workspace.createAsChild = async function ({ parentId, question, totalBudget}, { event }) {
    const _workspace = await sequelize.models.Workspace.create({ parentId, totalBudget }, { event, questionValue: question })
    return _workspace
  }

  Workspace.prototype.subtreeWorkspaces = async function () {
    const directChildren = await this.getChildWorkspaces();
    let allChildren = [...directChildren];
    for (const child of directChildren) {
      const subchildren = await child.subtreeWorkspaces();
      allChildren = [...allChildren, ...subchildren]
    }
    return allChildren
  }


  Workspace.prototype.toHash = async function () {
    const blocks = await this.visibleBlocks()
    const _blocks = blocks.map(b => ({
      value: b.value,
      relationship: this.blockToRelationship(b)
    }))
    return JSON.stringify(_blocks)
  }

  Workspace.prototype.workSpaceOrderAppend = function (element) {
    return [...this.childWorkspaceOrder, element]
  }

  Workspace.prototype.changeAllocationToChild = async function (childWorkspace: any, newTotalBudget: number, { event }) {
    const budgetToAddToChild = newTotalBudget - childWorkspace.totalBudget
    
    const childHasNecessaryBudget = newTotalBudget >= childWorkspace.allocatedBudget
    if (!childHasNecessaryBudget){
      throw new Error(`Child workspace allocated budget ${childWorkspace.allocatedBudget} exceeds new totalBudget ${newTotalBudget}`)
    }

    const parentHasNeccessaryRemainingBudget = this.remainingBudget - budgetToAddToChild >= 0
    if (!parentHasNeccessaryRemainingBudget) {
      throw new Error(`This workspace does not have the allocated budget necessary for child to get ${budgetToAddToChild} difference`)
    }

    await childWorkspace.update({totalBudget: newTotalBudget}, {event})

    await this.update({
      allocatedBudget: this.allocatedBudget + budgetToAddToChild,
    }, { event })
  }

  Workspace.prototype.updatePointerImports = async function (pointerIds, { event }) {
    const pointerImports = await this.getPointerImports()
    for (const pointerId of _.uniq(pointerIds)) {
      if (!_.includes(pointerImports.map(p => p.pointerId), pointerId)) {
        const pointer = await sequelize.models.Pointer.findById(pointerId);
        if (!pointer) {
          console.error("The relevant pointer for pointer import ", pointerId, " does not exist.")
        } else {
          await this.createPointerImport({ pointerId }, { event })
        }
      }
    }
  }

  Workspace.prototype.createChild = async function ({ event, question, totalBudget }) {
    const child = await sequelize.models.Workspace.createAsChild({ parentId: this.id, question, totalBudget }, { event })
    if (this.remainingBudget < child.totalBudget){
      throw new Error(`Parent workspace does not have enough remainingBudget. Has: ${this.remainingBudget}. Needs: ${child.totalBudget}.`)
    }
    const newAllocatedBudget = this.allocatedBudget + child.totalBudget;
    await this.update({
      allocatedBudget: newAllocatedBudget,
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    }, { event })
    return child
  }

  //private
  Workspace.prototype.getConnectedPointers = async function () {
    const blocks = await this.visibleBlocks()
    let _connectedPointers: string[] = []
    for (const block of blocks) {
      const blockPointerIds = await block.connectedPointers()
      _connectedPointers = [..._connectedPointers, ...blockPointerIds]
    }

    return _connectedPointers
  }

  Workspace.prototype.blockIdToRelationship = async function (blockId) {
    const block = await sequelize.models.Block.findById(blockId)
    return this.blockToRelationship(block);
  }

  Workspace.prototype.blockToRelationship = function (block) {
    if (block.workspaceId === this.id){
      return {type: block.type, childIndex: NaN}
    } else {
      const childIndex = _.findIndex(this.childWorkspaceOrder, e => e === block.workspaceId)
      if (childIndex !== -1) {
        return {type: block.type, childIndex}
      }
      else {
        throw new Error(`Relationship between block ${block.id} and workspace ${this.id} not found.`)
      }
    }
  }

  Workspace.prototype.relationshipToBlock = async function (relationship) {
    console.log("YO", relationship)
    if (!_.isFinite(relationship.childIndex)){
      const directBlocks = await this.getBlocks();
      return directBlocks.find(b => b.type === relationship.type)
    } else {
      const results = await sequelize.models.Block.findAll({
        where: {
          workspaceId: {
            [Op.in]: [this.childWorkspaceOrder[relationship.childIndex]],
          },
          type: {
            [Op.in]: [relationship.type],
          }
        }
      });
      return results[0];
    }
  }

  Workspace.prototype.getVisibleChildBlocks = async function () {
    return await sequelize.models.Block.findAll({
      where: {
        workspaceId: {
          [Op.in]: this.childWorkspaceOrder,
        },
        type: {
          [Op.in]: ["QUESTION", "ANSWER"],
        }
      }
    })
  }

  //private
  Workspace.prototype.visibleBlocks = async function () {
    let directBlocks = await this.getBlocks();
    let childBlocks = await this.getVisibleChildBlocks();
    return [...directBlocks, ...childBlocks]
  }

  Workspace.prototype.fastForwardMutations = async function (event) {
    const hash = await this.toHash();
    const otherMutation = await this.WorkspaceMutation.findOne({
        where: {
            beginningHash: hash
        }
    })
    if (otherMutation){
        const mutation = otherMutation.mutation;
        const _mutation = concernFromJSON(mutation);
        await _mutation.init(mutation, this)
        const result = _mutation.run(this, event)
    }
  }

  return Workspace;
};

export default WorkspaceModel;