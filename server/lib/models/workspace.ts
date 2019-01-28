"use strict";
import * as Sequelize from "sequelize";
import uuidv4 from "uuid/v4";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";
const Op = Sequelize.Op;
import * as _ from "lodash";

const WorkspaceModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Workspace = sequelize.define(
    "Workspace",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isEligibleForAssignment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isEligibleForOracle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isStale: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isNotStaleRelativeToUser: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      hasTimeBudget: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasIOConstraints: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isCurrentlyResolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      wasAnsweredByOracle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      ...eventRelationshipColumns(DataTypes),
      childWorkspaceOrder: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      hasBeenDeletedByAncestor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      totalBudget: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      timeSpentOnThisWorkspace: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      allocatedBudget: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      hasAncestorAnsweredByOracle: {
        type: Sequelize.VIRTUAL(Sequelize.BOOLEAN, [
          "id",
        ]),
        get: async function() {
          let curWorkspace = await sequelize.models.Workspace.findById(this.get("id"));
          while (curWorkspace.parentId) {
            curWorkspace = await sequelize.models.Workspace.findById(curWorkspace.parentId);
            if (curWorkspace.wasAnsweredByOracle) {
              return true;
            }
          }
          return false;
        },
      },
      hasTimeBudgetOfRootParent: {
        type: Sequelize.VIRTUAL(Sequelize.BOOLEAN, [
          "id",
        ]),
        get: async function() {
          let curWorkspace = await sequelize.models.Workspace.findById(this.get("id"));
          while (curWorkspace.parentId) {
            curWorkspace = await sequelize.models.Workspace.findById(curWorkspace.parentId);
          }

          return curWorkspace.hasTimeBudget;
        },
      },
      hasIOConstraintsOfRootParent: {
        type: Sequelize.VIRTUAL(Sequelize.BOOLEAN, [
          "id",
        ]),
        get: async function() {
          let curWorkspace = await sequelize.models.Workspace.findById(this.get("id"));
          while (curWorkspace.parentId) {
            curWorkspace = await sequelize.models.Workspace.findById(curWorkspace.parentId);
          }

          return curWorkspace.hasIOConstraints;
        },
      },
      remainingBudget: {
        type: Sequelize.VIRTUAL(Sequelize.INTEGER, [
          "totalBudget",
          "allocatedBudget",
        ]),
        get: function() {
          return this.get("totalBudget") - this.get("allocatedBudget");
        },
      },
      budgetUsedWorkingOnThisWorkspace: {
        type: Sequelize.VIRTUAL(Sequelize.INTEGER, [
          "allocatedBudget",
          "childWorkspaceOrder",
          "timeSpentOnThisWorkspace",
        ]),
        get: async function() {
          if (this.get("timeSpentOnThisWorkspace") > 0) {
            return this.get("timeSpentOnThisWorkspace");
          }

          let howMuchSpentOnChildren = 0;
          for (const childId of this.get("childWorkspaceOrder")) {
            const child = await sequelize.models.Workspace.findById(childId);
            howMuchSpentOnChildren += child.totalBudget;
          }
          return this.get("allocatedBudget") - howMuchSpentOnChildren;
        },
      },
      connectedPointers: {
        type: Sequelize.VIRTUAL(Sequelize.ARRAY(Sequelize.JSON), ["id"]),
        get: async function() {
          const _connectedPointers = await this.getConnectedPointers();
          const values: any = [];
          for (const pointer of _connectedPointers) {
            const value = await pointer.value;
            if (value) {
              values.push(value);
            } else {
              console.error(
                `Error: Value for pointer with id ${
                  pointer.id
                } was not found in its respecting block.`
              );
            }
          }
          return values.filter(v => !!v);
        },
      },
      exportLockStatusInfo: {
        type: Sequelize.VIRTUAL(Sequelize.ARRAY(Sequelize.JSON), ["id"]),
        get: async function() {
          const exportWorkspaceLockRelations = await sequelize.models.ExportWorkspaceLockRelation.findAll({
            where: {
              workspaceId: this.get("id"),
            }
          });
          return exportWorkspaceLockRelations;
        },
      },
      connectedPointersOfSubtree: {
        type: Sequelize.VIRTUAL(Sequelize.ARRAY(Sequelize.JSON), ["id"]),
        get: async function() {
          const _connectedPointers = await this.getConnectedPointersOfSubtree();
          const values: any = [];
          for (const pointer of _connectedPointers) {
            const value = await pointer.value;
            if (value) {
              values.push(value);
            } else {
              console.error(
                `Error: Value for pointer with id ${
                  pointer.id
                } was not found in its respecting block.`
              );
            }
          }
          return values.filter(v => !!v);
        },
      },
    },
    {
      hooks: {
        ...eventHooks.beforeValidate,
        afterCreate: async (workspace, { event, questionValue }) => {
          const blocks = await workspace.getBlocks();
          if (questionValue) {
            await workspace.createBlock(
              { type: "QUESTION", value: questionValue },
              { event }
            );
          } else {
            await workspace.createBlock({ type: "QUESTION" }, { event });
          }
          await workspace.createBlock({ type: "SCRATCHPAD" }, { event });
          await workspace.createBlock({ type: "ANSWER" }, { event });
          await workspace.createBlock({ type: "SUBQUESTION_DRAFT" }, { event });
        },
      },
    }
  );
  Workspace.associate = function(models) {
    Workspace.ChildWorkspaces = Workspace.hasMany(models.Workspace, {
      as: "childWorkspaces",
      foreignKey: "parentId",
    });
    Workspace.PointerImports = Workspace.hasMany(models.PointerImport, {
      as: "pointerImports",
      foreignKey: "workspaceId",
    });
    Workspace.ParentWorkspace = Workspace.belongsTo(models.Workspace, {
      as: "parentWorkspace",
      foreignKey: "parentId",
    });
    Workspace.Blocks = Workspace.hasMany(models.Block, {
      as: "blocks",
      foreignKey: "workspaceId",
    });
    addEventAssociations(Workspace, models);
  };

  Workspace.createAsChild = async function(
    { id, parentId, question, totalBudget, creatorId, isPublic },
    { event }
  ) {
    const _workspace = await sequelize.models.Workspace.create(
      { id = uuidv4(), parentId, totalBudget, creatorId, isPublic },
      { event, questionValue: question }
    );

    return _workspace;
  };

  Workspace.prototype.workSpaceOrderAppend = function(element) {
    return [...this.childWorkspaceOrder, element];
  };

  Workspace.prototype.changeAllocationToChild = async function(
    childWorkspace: any,
    newTotalBudget: number,
    { event }
  ) {
    const budgetToAddToChild = newTotalBudget - childWorkspace.totalBudget;

    const childHasNecessaryBudget =
      newTotalBudget >= childWorkspace.allocatedBudget;
    if (!childHasNecessaryBudget) {
      throw new Error(
        `Child workspace allocated budget ${
          childWorkspace.allocatedBudget
        } exceeds new totalBudget ${newTotalBudget}`
      );
    }

    const parentHasNeccessaryRemainingBudget =
      this.remainingBudget - budgetToAddToChild >= 0;
    if (!parentHasNeccessaryRemainingBudget) {
      throw new Error(
        `This workspace does not have the allocated budget necessary for child to get ${budgetToAddToChild} difference`
      );
    }

    const budgetIncreased = childWorkspace.totalBudget < newTotalBudget;

    await childWorkspace.update({
      isStale: budgetIncreased ? true : childWorkspace.isStale,
      totalBudget: newTotalBudget
    }, { event });

    await this.update(
      {
        allocatedBudget: this.allocatedBudget + budgetToAddToChild,
      },
      { event }
    );
  };

  Workspace.prototype.updatePointerImports = async function(
    pointerIds,
    { event }
  ) {
    const pointerImports = await this.getPointerImports();
    for (const pointerId of _.uniq(pointerIds)) {
      if (!_.includes(pointerImports.map(p => p.pointerId), pointerId)) {
        const pointer = await sequelize.models.Pointer.findById(pointerId);
        if (!pointer) {
          console.error(
            "The relevant pointer for pointer import ",
            pointerId,
            " does not exist."
          );
        } else {
          await this.createPointerImport({ pointerId }, { event });
        }
      }
    }
  };

  Workspace.prototype.createChild = async function({
    id,
    event,
    question,
    totalBudget,
    creatorId,
    isPublic,
  }) {
    const child = await sequelize.models.Workspace.createAsChild(
      { id, parentId: this.id, question, totalBudget, creatorId, isPublic },
      { event }
    );
    if (this.remainingBudget < child.totalBudget) {
      throw new Error(
        `Parent workspace does not have enough remainingBudget. Has: ${
          this.remainingBudget
        }. Needs: ${child.totalBudget}.`
      );
    }
    const newAllocatedBudget = this.allocatedBudget + child.totalBudget;
    await this.update(
      {
        allocatedBudget: newAllocatedBudget,
        childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
      },
      { event }
    );
    return child;
  };

  // private
  Workspace.prototype.getConnectedPointers = async function() {
    const blocks = await this.visibleBlocks();
    let _connectedPointers: string[] = [];
    for (const block of blocks) {
      const blockPointerIds = await block.connectedPointers({ pointersSoFar: _connectedPointers});
      _connectedPointers = [..._connectedPointers, ...blockPointerIds];
    }

    return _connectedPointers;
  };

  // Returns an array containing the pointers connected to a workspace and all
  // of its descendants. Passes "pointerSoFar" parameter to recursive
  // subcalls in order to avoid duplicate SQL queries for pointers.
  Workspace.prototype.getConnectedPointersOfSubtree = async function(
    pointersSoFar = []
  ) {
    const connectedPointersOfSubtree = [];

    // Can use this.getBlocks instead of this.getVisibleBlocks because later we
    // will go on to iterate through all the children workspaces.
    const blocks = await this.getBlocks();

    for (const block of blocks) {
      const blockPointersToAdd = await block.connectedPointers({ pointersSoFar });
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        blockPointersToAdd
      );
      pointersSoFar = pointersSoFar.concat(blockPointersToAdd);
    }

    for (const childWorkspaceId of this.childWorkspaceOrder) {
      const currentWorkspace = await sequelize.models.Workspace.findById(
        childWorkspaceId
      );
      const workspacePointersToAdd = await currentWorkspace.getConnectedPointersOfSubtree(
        pointersSoFar
      );
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        workspacePointersToAdd
      );
    }

    return connectedPointersOfSubtree;
  };

  // private
  Workspace.prototype.visibleBlocks = async function() {
    let blocks = await this.getBlocks();
    const connectingChildBlocks = await sequelize.models.Block.findAll({
      where: {
        workspaceId: {
          [Op.in]: this.childWorkspaceOrder,
        },
        type: {
          [Op.in]: ["QUESTION", "ANSWER"],
        },
      },
    });
    blocks = [...blocks, ...connectingChildBlocks];
    return blocks;
  };

  return Workspace;
};

export default WorkspaceModel;
