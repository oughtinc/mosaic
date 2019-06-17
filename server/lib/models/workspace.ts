import * as Sequelize from "sequelize";
import { UUIDV4, IntegerDataType } from "sequelize";
import * as uuidv4 from "uuid/v4";
import * as _ from "lodash";
import { createHonestOracleDefaultBlockValues } from "./helpers/defaultHonestOracleBlocks";
import { createMaliciousOracleDefaultBlockValues } from "./helpers/defaultMaliciousOracleBlocks";
import { createDefaultRootLevelBlockValues } from "./helpers/defaultRootLevelBlocks";

import { isInOracleMode } from "../globals/isInOracleMode";
import { getAllInlinesAsArray } from "../utils/slateUtils";

import {
  AfterCreate,
  AfterUpdate,
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  Min,
  Model,
  Table,
} from "sequelize-typescript";
import PointerImport from "./pointerImport";
import Block from "./block";
import Tree from "./tree";
import ExportWorkspaceLockRelation from "./exportWorkspaceLockRelation";
import Experiment from "./experiment";
import Pointer from "./pointer";

const Op = Sequelize.Op;

@Table
export default class Workspace extends Model<Workspace> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  @Column(DataType.INTEGER)
  public serialId: number;

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

  @Default(false)
  @Column(DataType.BOOLEAN)
  public isRequestingLazyUnlock: boolean;

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
  // @ts-ignore
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

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["id"]))
  public get hasAncestorAnsweredByOracle() {
    return (async () => {
      let curWorkspace = await Workspace.findByPk(this.get("id") as string);
      if (curWorkspace === null) {
        return false;
      }
      while (curWorkspace.parentId) {
        curWorkspace = await Workspace.findByPk(curWorkspace.parentId);
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

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["rootWorkspaceId"]))
  public get hasTimeBudgetOfRootParent() {
    return (async () => {
      const rootWorkspace = await Workspace.findByPk(this.get(
        "rootWorkspaceId",
      ) as string);
      if (rootWorkspace === null) {
        return false;
      }
      return rootWorkspace.hasTimeBudget;
    })();
  }

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.BOOLEAN, ["rootWorkspaceId"]))
  public get hasIOConstraintsOfRootParent() {
    return (async () => {
      const rootWorkspace = await Workspace.findByPk(this.get(
        "rootWorkspaceId",
      ) as string);
      if (rootWorkspace === null) {
        return false;
      }
      return rootWorkspace.hasIOConstraints;
    })();
  }

  @Column(
    // @ts-ignore
    new DataType.VIRTUAL(DataType.INTEGER, ["totalBudget", "allocatedBudget"]),
  )
  public get remainingBudget() {
    return (
      (this.get("totalBudget") as number) -
      (this.get("allocatedBudget") as number)
    );
  }

  @Column(
    // @ts-ignore
    new DataType.VIRTUAL(DataType.INTEGER, [
      "allocatedBudget",
      "childWorkspaceOrder",
      "timeSpentOnThisWorkspace",
    ]),
  )
  public get budgetUsedWorkingOnThisWorkspace() {
    return (async () => {
      if ((this.get("timeSpentOnThisWorkspace") as number) > 0) {
        return this.get("timeSpentOnThisWorkspace") as number;
      }

      let howMuchSpentOnChildren = 0;
      for (const childId of this.get("childWorkspaceOrder") as string[]) {
        const child = await Workspace.findByPk(childId);
        if (child !== null) {
          howMuchSpentOnChildren += child.totalBudget;
        }
      }
      return (this.get("allocatedBudget") as number) - howMuchSpentOnChildren;
    })();
  }

  // @ts-ignore
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
            } was not found in its respecting block.`,
          );
        }
      }
      return values.filter(v => !!v);
    })();
  }

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.ARRAY(Sequelize.JSON), ["id"]))
  public get exportLockStatusInfo() {
    return (async () => {
      return await ExportWorkspaceLockRelation.findAll({
        where: {
          workspaceId: this.get("id") as string,
        },
      });
    })();
  }

  // @ts-ignore
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
            } was not found in its respecting block.`,
          );
        }
      }
      return values.filter(v => !!v);
    })();
  }

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.INTEGER, ["id"]))
  public get depth() {
    return (async () => {
      const isInOracleModeValue = isInOracleMode.getValue();
      let depth = 1;
      let curWorkspace = await Workspace.findByPk(this.get("id") as string);
      if (curWorkspace === null) {
        return depth;
      }
      if (isInOracleModeValue) {
        while (curWorkspace.parentId) {
          curWorkspace = await Workspace.findByPk(curWorkspace.parentId);
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

  @Column(
    // @ts-ignore
    new DataType.VIRTUAL(DataType.BOOLEAN, [
      "createdAt",
      "isEligibleForMaliciousOracle",
    ]),
  )
  public get canShowCompactTreeView() {
    const dateAfterWhichCompactTreeWorks = Date.parse(
      "2019-04-08 23:26:03.572+00",
    );
    return (
      Date.parse(this.get("createdAt") as string) >
        dateAfterWhichCompactTreeWorks &&
      (this.get("isEligibleForMaliciousOracle") as boolean)
    );
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

  @AllowNull
  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public rootWorkspaceId: string;

  @HasMany(() => Block)
  public blocks: Block[];

  @HasOne(() => Tree, "rootWorkspaceId")
  public tree: Tree;

  @AfterCreate
  public static async populateBlocks(workspace: Workspace, { questionValue }) {
    if (questionValue) {
      await workspace.$create("block", {
        type: "QUESTION",
        value: questionValue,
      });
    } else {
      await workspace.$create("block", { type: "QUESTION" });
    }

    if (workspace.isRequestingLazyUnlock) {
      // no default content at the moment
    } else if (
      workspace.isEligibleForHonestOracle &&
      isInOracleMode.getValue()
    ) {
      const {
        scratchpadBlockValue,
        answerDraftBlockValue,
        responseBlockValue,
      } = createHonestOracleDefaultBlockValues(questionValue);
      await workspace.$create("block", {
        type: "SCRATCHPAD",
        value: scratchpadBlockValue,
      });
      await workspace.$create("block", {
        type: "SUBQUESTION_DRAFT",
        value: answerDraftBlockValue,
      });
      await workspace.$create("block", {
        type: "ANSWER_DRAFT",
        value: responseBlockValue,
      });
    } else if (
      workspace.isEligibleForMaliciousOracle &&
      isInOracleMode.getValue()
    ) {
      if (workspace.parentId) {
        const {
          scratchpadBlockValue,
          answerDraftBlockValue,
          responseBlockValue,
        } = createMaliciousOracleDefaultBlockValues(questionValue);
        await workspace.$create("block", {
          type: "SCRATCHPAD",
          value: scratchpadBlockValue,
        });
        await workspace.$create("block", {
          type: "SUBQUESTION_DRAFT",
          value: answerDraftBlockValue,
        });
        await workspace.$create("block", {
          type: "ANSWER_DRAFT",
          value: responseBlockValue,
        });
      } else {
        const {
          scratchpadBlockValue,
          answerDraftBlockValue,
          responseBlockValue,
        } = createDefaultRootLevelBlockValues();
        await workspace.$create("block", {
          type: "SCRATCHPAD",
          value: scratchpadBlockValue,
        });
        await workspace.$create("block", {
          type: "SUBQUESTION_DRAFT",
          value: answerDraftBlockValue,
        });
        await workspace.$create("block", {
          type: "ANSWER_DRAFT",
          value: responseBlockValue,
        });
      }
    } else {
      await workspace.$create("block", { type: "SCRATCHPAD" });
      await workspace.$create("block", { type: "SUBQUESTION_DRAFT" });
      await workspace.$create("block", { type: "ANSWER_DRAFT" });
    }

    await workspace.$create("block", { type: "ANSWER" });
  }

  @AfterCreate
  public static async cacheRootWorkspace(workspace: Workspace) {
    if (workspace.parentId === null) {
      // this is the root of its own tree
      if (workspace.id !== workspace.rootWorkspaceId) {
        await workspace.update({ rootWorkspaceId: workspace.id });
      }
    } else {
      // inherit root from parent
      const parentWorkspace = (await workspace.$get(
        "parentWorkspace",
      )) as Workspace;
      if (workspace.rootWorkspaceId !== parentWorkspace.rootWorkspaceId) {
        await workspace.update({
          rootWorkspaceId: parentWorkspace.rootWorkspaceId,
        });
      }
    }
  }

  @AfterUpdate
  public static async updateCachedRootWorkspace(
    workspace: Workspace & { _changed: { [field: string]: boolean } },
  ) {
    if (workspace._changed.parentId) {
      // parent has changed, update cache
      await Workspace.cacheRootWorkspace(workspace);
    }
  }

  @AfterUpdate
  public static async updateChildCachedRootWorkspaces(
    workspace: Workspace & { _changed: { [field: string]: boolean } },
  ) {
    if (workspace._changed.rootWorkspaceId) {
      // cached root has changed, propogate to children
      const children = (await workspace.$get("childWorkspaces")) as Workspace[];
      await Promise.all(
        children.map(async child => {
          await child.update({
            rootWorkspaceId:
              workspace.rootWorkspaceId === null
                ? workspace.id
                : workspace.rootWorkspaceId,
          });
        }),
      );
    }
  }

  public static findByPkOrSerialId(pkOrSerialId) {
    if (pkOrSerialId.length < 10) {
      return Workspace.findOne({
        where: { serialId: Number(pkOrSerialId) },
      });
    }

    return Workspace.findByPk(pkOrSerialId);
  }

  public static async isNewChildWorkspaceHonestOracleEligible({ parentId }) {
    if (!isInOracleMode.getValue()) {
      return false;
    }

    const parentWorkspace = await Workspace.findByPk(parentId);
    if (parentWorkspace === null) {
      return false;
    }
    const isParentRootWorkspace = !parentWorkspace.parentId;
    const isParentOracleWorkspace =
      parentWorkspace.isEligibleForHonestOracle ||
      parentWorkspace.isEligibleForMaliciousOracle;

    if (isParentOracleWorkspace && !isParentRootWorkspace) {
      return false;
    }

    const rootWorkspace = await parentWorkspace.getRootWorkspace();

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

    const parentWorkspace = await Workspace.findByPk(parentId);
    if (parentWorkspace === null) {
      return false;
    }
    const isParentHonestOracleWorkspace =
      parentWorkspace.isEligibleForHonestOracle;
    if (!isParentHonestOracleWorkspace) {
      return false;
    }

    const rootWorkspace = await parentWorkspace.getRootWorkspace();

    // get experiment id
    const tree = (await rootWorkspace.$get("tree")) as Tree;
    const experiments = (await tree.$get("experiments")) as Experiment[];

    if (experiments.length === 0) {
      return false;
    }

    const mostRecentExperiment = _.sortBy(experiments, e => -e.createdAt)[0];
    return mostRecentExperiment.areNewWorkspacesOracleOnlyByDefault;
  }

  public static async createAsChild({
    parentId,
    question,
    totalBudget,
    creatorId,
    isPublic,
    isRequestingLazyUnlock,
    isEligibleForHonestOracle,
    isEligibleForMaliciousOracle,
    shouldOverrideToNormalUser,
  }) {
    if (shouldOverrideToNormalUser) {
      isEligibleForHonestOracle = false;
      isEligibleForMaliciousOracle = false;
    } else {
      isEligibleForHonestOracle =
        isEligibleForHonestOracle !== undefined
          ? isEligibleForHonestOracle
          : await Workspace.isNewChildWorkspaceHonestOracleEligible({
              parentId,
            });
      isEligibleForMaliciousOracle =
        isEligibleForMaliciousOracle !== undefined
          ? isEligibleForMaliciousOracle
          : await Workspace.isNewChildWorkspaceMaliciousOracleEligible({
              parentId,
            });
    }

    return await Workspace.create(
      {
        id: uuidv4(),
        parentId,
        totalBudget,
        creatorId,
        isPublic,
        isRequestingLazyUnlock,
        isEligibleForHonestOracle,
        isEligibleForMaliciousOracle,
      },
      { questionValue: question },
    );
  }

  public async getRootWorkspace() {
    if (this.rootWorkspaceId === null) {
      // this is a root
      return this;
    }

    const workspace = await Workspace.findByPk(this.rootWorkspaceId);
    if (workspace === null) {
      throw new Error("workspace has dangling pointer to root");
    }
    return workspace;
  }

  public workSpaceOrderAppend(element) {
    return [...this.childWorkspaceOrder, element];
  }

  public async changeAllocationToChild(
    childWorkspace: any,
    newTotalBudget: number,
  ) {
    const budgetToAddToChild = newTotalBudget - childWorkspace.totalBudget;

    const childHasNecessaryBudget =
      newTotalBudget >= childWorkspace.allocatedBudget;
    if (!childHasNecessaryBudget) {
      throw new Error(
        `Child workspace allocated budget ${
          childWorkspace.allocatedBudget
        } exceeds new totalBudget ${newTotalBudget}`,
      );
    }

    const parentHasNeccessaryRemainingBudget =
      this.remainingBudget - budgetToAddToChild >= 0;
    if (!parentHasNeccessaryRemainingBudget) {
      throw new Error(
        `This workspace does not have the allocated budget necessary for child to get ${budgetToAddToChild} difference`,
      );
    }

    const budgetIncreased = childWorkspace.totalBudget < newTotalBudget;

    await childWorkspace.update({
      isStale: budgetIncreased ? true : childWorkspace.isStale,
      totalBudget: newTotalBudget,
    });

    await this.update({
      allocatedBudget: this.allocatedBudget + budgetToAddToChild,
    });
  }

  public async createChild({
    question,
    totalBudget,
    creatorId,
    isPublic,
    shouldOverrideToNormalUser,
  }) {
    console.log(`
    
    
    In create child: ${Date.now()}
    
    
    
    `);
    const initialText = _.get(question, "[0].nodes[0].leaves[0].text", "");
    const isRequestingLazyUnlock =
      initialText
        .trim()
        .slice(0, 6)
        .toUpperCase() === "UNLOCK";

    let workspaceContainingLazyPointer;
    if (isRequestingLazyUnlock) {
      const idOfExportToUnlock = getAllInlinesAsArray(question)[0].data
        .pointerId;
      const exportToUnlock = await Pointer.findByPk(idOfExportToUnlock);
      if (exportToUnlock === null) {
        throw new Error(
          `Pointer ${idOfExportToUnlock} does not exist in the database`,
        );
      }
      const blockContainingLazyPointer = await Block.findByPk(
        exportToUnlock.sourceBlockId,
      );
      if (blockContainingLazyPointer === null) {
        throw new Error(
          `Block for pointer ${idOfExportToUnlock} does not exist in the database`,
        );
      }
      workspaceContainingLazyPointer = await Workspace.findByPk(
        blockContainingLazyPointer.workspaceId,
      );
    }

    const child = await Workspace.createAsChild({
      parentId: this.id,
      question,
      totalBudget,
      creatorId,
      isPublic,
      isRequestingLazyUnlock,
      isEligibleForHonestOracle: isRequestingLazyUnlock
        ? workspaceContainingLazyPointer.isEligibleForHonestOracle
        : undefined,
      isEligibleForMaliciousOracle: isRequestingLazyUnlock
        ? workspaceContainingLazyPointer.isEligibleForMaliciousOracle
        : undefined,
      shouldOverrideToNormalUser,
    });
    if (this.remainingBudget < child.totalBudget) {
      throw new Error(
        `Parent workspace does not have enough remainingBudget. Has: ${
          this.remainingBudget
        }. Needs: ${child.totalBudget}.`,
      );
    }

    const newAllocatedBudget = this.allocatedBudget + child.totalBudget;
    await this.update({
      allocatedBudget: newAllocatedBudget,
      childWorkspaceOrder: this.workSpaceOrderAppend(child.id),
    });

    console.log(`
    
    
    End of createChild: ${Date.now()}
    
    
    
    `);
    return child;
  }

  private async getConnectedPointers(): Promise<Pointer[]> {
    const blocks = await this.visibleBlocks();
    let _connectedPointers: Pointer[] = [];
    for (const block of blocks) {
      const blockPointerIds = await block.connectedPointers({
        pointersSoFar: _connectedPointers,
      });
      _connectedPointers = [..._connectedPointers, ...blockPointerIds];
    }

    return _connectedPointers;
  }

  // Returns an array containing the pointers connected to a workspace and all
  // of its descendants. Passes "pointerSoFar" parameter to recursive
  // subcalls in order to avoid duplicate SQL queries for pointers.
  private async getConnectedPointersOfSubtree(
    pointersSoFar: Pointer[] = [],
  ): Promise<Pointer[]> {
    let connectedPointersOfSubtree: Pointer[] = [];

    // Can use this.getBlocks instead of this.getVisibleBlocks because later we
    // will go on to iterate through all the children workspaces.
    const blocks = (await this.$get("blocks")) as Block[];

    for (const block of blocks) {
      const blockPointersToAdd = await block.connectedPointers({
        pointersSoFar,
      });
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        blockPointersToAdd,
      );
      pointersSoFar = pointersSoFar.concat(blockPointersToAdd);
    }

    const childWorkspaces = (await this.$get("childWorkspaces")) as Workspace[];

    for (const childWorkspace of childWorkspaces) {
      const workspacePointersToAdd = await childWorkspace.getConnectedPointersOfSubtree(
        pointersSoFar,
      );
      connectedPointersOfSubtree = connectedPointersOfSubtree.concat(
        workspacePointersToAdd,
      );
    }

    return connectedPointersOfSubtree;
  }

  private async visibleBlocks() {
    let blocks = (await this.$get("blocks")) as Block[];
    const connectingChildBlocks = await Block.findAll({
      where: {
        workspaceId: {
          [Op.in]: this.childWorkspaceOrder,
        },
        type: {
          [Op.in]: ["QUESTION", "ANSWER", "ANSWER_DRAFT"],
        },
      },
    });
    blocks = [...blocks, ...connectingChildBlocks];
    return blocks;
  }
}
