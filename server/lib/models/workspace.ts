import * as Sequelize from "sequelize";
import { UUIDV4 } from "sequelize";
import * as uuidv4 from "uuid/v4";
import * as _ from "lodash";
import { createHonestOracleDefaultBlockValues } from "./helpers/defaultHonestOracleBlocks";
import { createMaliciousOracleDefaultBlockValues } from "./helpers/defaultMaliciousOracleBlocks";
import { createDefaultRootLevelBlockValues } from "./helpers/defaultRootLevelBlocks";

import { isInOracleMode } from "../globals/isInOracleMode";

import {
  AfterCreate,
  AllowNull,
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  Min,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import PointerImport from "./pointerImport";
import Block from "./block";
import Tree from "./tree";
import ExportWorkspaceLockRelation from "./exportWorkspaceLockRelation";
import Experiment from "./experiment";
import Pointer from "./pointer";

const Op = Sequelize.Op;

@Table({ tableName: "Workspaces" })
export default class Workspace extends Model<Workspace> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public creatorId: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isPublic: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isEligibleForAssignment: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isEligibleForHonestOracle: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  public isEligibleForMaliciousOracle: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  public isStale: boolean;

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSON)
  public isNotStaleRelativeToUser: Object[];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isArchived: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public hasTimeBudget: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  public hasIOConstraints: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isCurrentlyResolved: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public wasAnsweredByOracle: boolean;

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  public childWorkspaceOrder: string[];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public hasBeenDeletedByAncestor: boolean;

  @AllowNull(false)
  @Default(1)
  @Min(0)
  @Column(DataType.INTEGER)
  public totalBudget: number;

  @AllowNull(false)
  @Default(0)
  @Min(0)
  @Column(DataType.INTEGER)
  public timeSpentOnThisWorkspace: number;

  @AllowNull(false)
  @Default(0)
  @Min(0)
  @Column(DataType.INTEGER)
  public allocatedBudget: number;

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["id"]))
  public get hasAncestorAnsweredByOracle() {
    return (async () => {
      let curWorkspace = await Workspace.findById(this.get("id"));
      if (curWorkspace === null) {
        return false;
      }
      while (curWorkspace.parentId) {
        curWorkspace = await Workspace.findById(curWorkspace.parentId);
        if (curWorkspace === null) {
          return false;
        }
        if (curWorkspace.wasAnsweredByOracle) {
          return true;
        }
      }
      return false;
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["id"]))
  public get hasTimeBudgetOfRootParent() {
    return (async () => {
      const rootWorkspace = await Workspace.getRootWorkspace(await Workspace.findById(this.get("id")));
      if (rootWorkspace === null) {
        return false;
      }
      return rootWorkspace.hasTimeBudget;
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["id"]))
  public get hasIOConstraintsOfRootParent() {
    return (async () => {
      const rootWorkspace = await Workspace.getRootWorkspace(await Workspace.findById(this.get("id")));
      if (rootWorkspace === null) {
        return false;
      }
      return rootWorkspace.hasIOConstraints;
    })();
  }

  @Column(
    new DataType.VIRTUAL(DataType.INTEGER, ["totalBudget", "allocatedBudget"])
  )
  public get remainingBudget() {
    return this.get("totalBudget") - this.get("allocatedBudget");
  }

  @Column(
    new DataType.VIRTUAL(DataType.INTEGER, [
      "allocatedBudget",
      "childWorkspaceOrder",
      "timeSpentOnThisWorkspace"
    ])
  )
  public get budgetUsedWorkingOnThisWorkspace() {
    return (async () => {
      if (this.get("timeSpentOnThisWorkspace") > 0) {
        return this.get("timeSpentOnThisWorkspace");
      }

      let howMuchSpentOnChildren = 0;
      for (const childId of this.get("childWorkspaceOrder")) {
        const child = await Workspace.findById(childId);
        if (child !== null) {
          howMuchSpentOnChildren += child.totalBudget;
        }
      }
      return this.get("allocatedBudget") - howMuchSpentOnChildren;
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.STRING, ["id"]))
  public get idOfRootWorkspace() {
    return (async () => {
      const rootWorkspace = await Workspace.getRootWorkspace(await Workspace.findById(this.get("id")));
      if (rootWorkspace === null) {
        return false;
      }
      return rootWorkspace.id;
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.ARRAY(Sequelize.JSON), ["id"]))
  public get connectedPointers() {
    return (async () => {
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
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.ARRAY(Sequelize.JSON), ["id"]))
  public get exportLockStatusInfo() {
    return (async () => {
      return await ExportWorkspaceLockRelation.findAll({
        where: {
          workspaceId: this.get("id")
        }
      });
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.ARRAY(Sequelize.JSON), ["id"]))
  public get connectedPointersOfSubtree() {
    return (async () => {
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
    })();
  }

  @Column(new DataType.VIRTUAL(DataType.INTEGER, ["id"]))
  public get depth() {
    return (async () => {
      const isInOracleModeValue = isInOracleMode.getValue();
      let depth = 1;
      let curWorkspace = await Workspace.findById(this.get("id"));
      if (curWorkspace === null) {
        return depth;
      }
      if (isInOracleModeValue) {
        while (curWorkspace.parentId) {
          curWorkspace = await Workspace.findById(curWorkspace.parentId);
          if (curWorkspace === null) {
            return depth;
          }
          if (
            !curWorkspace.isEligibleForHonestOracle &&
            !curWorkspace.isEligibleForMaliciousOracle
          ) {
            depth++;
          }
        }
      } else {
        depth++;
      }

      return depth;
    })();
  }

  @HasMany(() => Workspace, "parentId")
  public childWorkspaces: Workspace[];

  @HasMany(() => PointerImport)
  public pointerImports: PointerImport[];

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public parentId: string;

  @BelongsTo(() => Workspace, "parentId")
  public parentWorkspace: Workspace;

  @HasMany(() => Block)
  public blocks: Block[];

  @HasOne(() => Tree, "rootWorkspaceId")
  public tree: Tree;

  @ForeignKey(() => EventModel)
  @Column(DataType.INTEGER)
  public createdAtEventId: number;

  @BelongsTo(() => EventModel, "createdAtEventId")
  public createdAtEvent: Event;

  @ForeignKey(() => EventModel)
  @Column(DataType.INTEGER)
  public updatedAtEventId: number;

  @BelongsTo(() => EventModel, "updatedAtEventId")
  public updatedAtEvent: Event;

  @BeforeValidate
  public static updateEvent(item: Workspace, options: { event?: EventModel }) {
    const event = options.event;
    if (event) {
      if (!item.createdAtEventId) {
        item.createdAtEventId = event.dataValues.id;
      }
      item.updatedAtEventId = event.dataValues.id;
    }
  }

  @BeforeUpdate
  public static workaroundOnEventUpdate(
    item: Workspace,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }

  @AfterCreate
  public static async populateBlocks(
    workspace: Workspace,
    { event, questionValue }
  ) {
    if (questionValue) {
      await workspace.$create(
        "block",
        { type: "QUESTION", value: questionValue },
        { event }
      );
    } else {
      await workspace.$create("block", { type: "QUESTION" }, { event });
    }

          if (workspace.isEligibleForHonestOracle && isInOracleMode.getValue()) {
            const {
              scratchpadBlockValue,
              answerDraftBlockValue,
              responseBlockValue
            } = createHonestOracleDefaultBlockValues(questionValue);
            await workspace.$create("block", { type: "SCRATCHPAD", value: scratchpadBlockValue }, { event });
            await workspace.$create("block", { type: "SUBQUESTION_DRAFT", value: answerDraftBlockValue }, { event });
            await workspace.$create("block", { type: "ANSWER_DRAFT", value: responseBlockValue }, { event });
          } else if (workspace.isEligibleForMaliciousOracle && isInOracleMode.getValue()) {
            if (workspace.parentId) {
              const {
                scratchpadBlockValue,
                answerDraftBlockValue,
                responseBlockValue
              } = createMaliciousOracleDefaultBlockValues(questionValue);
              await workspace.$create("block", { type: "SCRATCHPAD", value: scratchpadBlockValue }, { event });
              await workspace.$create("block", { type: "SUBQUESTION_DRAFT", value: answerDraftBlockValue }, { event });
              await workspace.$create("block", { type: "ANSWER_DRAFT", value: responseBlockValue }, { event });
            } else {
              const {
                scratchpadBlockValue,
                answerDraftBlockValue,
                responseBlockValue
              } = createDefaultRootLevelBlockValues();
              await workspace.$create("block", { type: "SCRATCHPAD", value: scratchpadBlockValue }, { event });
              await workspace.$create("block", { type: "SUBQUESTION_DRAFT", value: answerDraftBlockValue }, { event });
              await workspace.$create("block", { type: "ANSWER_DRAFT", value: responseBlockValue }, { event });
            }
          } else {
            await workspace.$create("block", { type: "SCRATCHPAD" }, { event });
            await workspace.$create("block", { type: "SUBQUESTION_DRAFT" }, { event });
            await workspace.$create("block", { type: "ANSWER_DRAFT" }, { event });
          }

    await workspace.$create("block", { type: "ANSWER" }, { event });
  }

  public static async isNewChildWorkspaceHonestOracleEligible({ parentId }) {
    if (!isInOracleMode.getValue()) {
      return false;
    }

    const parentWorkspace = await Workspace.findById(parentId);
    if (parentWorkspace === null) {
      return false;
    }
    const isParentRootWorkspace = !parentWorkspace.parentId;
    const isParentOracleWorkspace = parentWorkspace.isEligibleForHonestOracle || parentWorkspace.isEligibleForMaliciousOracle;

    if (isParentOracleWorkspace && !isParentRootWorkspace) {
      return false;
    }

    const rootWorkspace = await Workspace.getRootWorkspace(parentWorkspace);
    if (rootWorkspace === null) {
      return false;
    }

    // get experiment id
    const tree = (await rootWorkspace.$get("tree")) as Tree;
    const experiments = (await tree.$get("experiments")) as Experiment[];

    if (experiments.length === 0) {
      return false;
    }

    const mostRecentExperiment = _.sortBy(experiments, e => -e.createdAt)[0];
    return mostRecentExperiment.areNewWorkspacesOracleOnlyByDefault;
  }

  public static async isNewChildWorkspaceMaliciousOracleEligible({ parentId }) {
    if (!isInOracleMode.getValue()) {
      return false;
    }

    const parentWorkspace = await Workspace.findById(parentId);
    if (parentWorkspace === null) {
      return false;
    }
    const isParentHonestOracleWorkspace =
      parentWorkspace.isEligibleForHonestOracle;
    if (!isParentHonestOracleWorkspace) {
      return false;
    }

    const rootWorkspace = await Workspace.getRootWorkspace(parentWorkspace);
    if (rootWorkspace === null) {
      return false;
    }

    // get experiment id
    const tree = (await rootWorkspace.$get("tree")) as Tree;
    const experiments = (await tree.$get("experiments")) as Experiment[];

    if (experiments.length === 0) {
      return false;
    }

    const mostRecentExperiment = _.sortBy(experiments, e => -e.createdAt)[0];
    return mostRecentExperiment.areNewWorkspacesOracleOnlyByDefault;
  }

  public static async createAsChild(
    { parentId, question, totalBudget, creatorId, isPublic },
    { event }
  ) {
    const isEligibleForHonestOracle = await Workspace.isNewChildWorkspaceHonestOracleEligible(
      { parentId }
    );
    const isEligibleForMaliciousOracle = await Workspace.isNewChildWorkspaceMaliciousOracleEligible(
      { parentId }
    );
    return await Workspace.create(
      {
        id: uuidv4(),
        parentId,
        totalBudget,
        creatorId,
        isPublic,
        isEligibleForHonestOracle,
        isEligibleForMaliciousOracle
      },
      { event, questionValue: question }
    );
  }

  private static async getRootWorkspace(curWorkspace: Workspace|null) {
    if (curWorkspace === null) {
      return null;
    }
    while (curWorkspace.parentId) {
      curWorkspace = await Workspace.findById(curWorkspace.parentId);
      if (curWorkspace === null) {
        return null;
      }
    }
    return curWorkspace;
  }

  public workSpaceOrderAppend(element) {
    return [...this.childWorkspaceOrder, element];
  }

  public async changeAllocationToChild(
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

    await childWorkspace.update(
      {
        isStale: budgetIncreased ? true : childWorkspace.isStale,
        totalBudget: newTotalBudget
      },
      { event }
    );

    await this.update(
      {
        allocatedBudget: this.allocatedBudget + budgetToAddToChild
      },
      { event }
    );
  }

  public async createChild({
    event,
    question,
    totalBudget,
    creatorId,
    isPublic
  }) {
    const child = await Workspace.createAsChild(
      { parentId: this.id, question, totalBudget, creatorId, isPublic },
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
        childWorkspaceOrder: this.workSpaceOrderAppend(child.id)
      },
      { event }
    );
    return child;
  }

  private async getConnectedPointers() {
    const blocks = await this.visibleBlocks();
    let _connectedPointers: string[] = [];
    for (const block of blocks) {
      const blockPointerIds = await block.connectedPointers({
        pointersSoFar: _connectedPointers
      });
      _connectedPointers = [..._connectedPointers, ...blockPointerIds];
    }

    return _connectedPointers;
  }

  // Returns an array containing the pointers connected to a workspace and all
  // of its descendants. Passes "pointerSoFar" parameter to recursive
  // subcalls in order to avoid duplicate SQL queries for pointers.
  private async getConnectedPointersOfSubtree(pointersSoFar = []) {
    let connectedPointersOfSubtree = [];

    // Can use this.getBlocks instead of this.getVisibleBlocks because later we
    // will go on to iterate through all the children workspaces.
    const blocks = (await this.$get("blocks")) as Block[];

    for (const block of blocks) {
      const blockPointersToAdd = await block.connectedPointers({
        pointersSoFar
      });
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        blockPointersToAdd
      );
      pointersSoFar = pointersSoFar.concat(blockPointersToAdd);
    }

    const childWorkspaces = (await this.$get("childWorkspaces")) as Workspace[];

    for (const childWorkspace of childWorkspaces) {
      const workspacePointersToAdd = await childWorkspace.getConnectedPointersOfSubtree(
        pointersSoFar
      );
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        workspacePointersToAdd
      );
    }

    return connectedPointersOfSubtree;
  }

  private async visibleBlocks() {
    let blocks = (await this.$get("blocks")) as Block[];
    const connectingChildBlocks = await Block.findAll({
      where: {
        workspaceId: {
          [Op.in]: this.childWorkspaceOrder
        },
        type: {
          [Op.in]: ["QUESTION", "ANSWER", "ANSWER_DRAFT"]
        }
      }
    });
    blocks = [...blocks, ...connectingChildBlocks];
    return blocks;
  }
}
