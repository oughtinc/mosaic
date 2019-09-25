import * as Sequelize from "sequelize";
import { UUIDV4, IntegerDataType } from "sequelize";
import * as uuidv4 from "uuid/v4";
import * as _ from "lodash";
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
import Assignment from "./assignment";

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

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isAwaitingHonestExpertDecision: boolean;

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

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.STRING, ["id"]))
  public get idOfHonestAnswerCandidate() {
    return (async () => {
      const workspace = await Workspace.findByPk(this.get("id") as string);

      const isExpertWorkspace =
        workspace.isEligibleForMaliciousOracle ||
        (workspace.isEligibleForHonestOracle &&
          !workspace.isAwaitingHonestExpertDecision);

      if (isExpertWorkspace) {
        return;
      }

      // The honest workspace has the honest answer candidate, but
      // not the pointer containing the honest answer candidate.
      // This pointer is contained in the malicious question.
      const maliciousWorkspace = await Workspace.findByPk(workspace.parentId);

      const maliciousQuestionBlock = (await maliciousWorkspace.$get(
        "blocks",
      )).find(b => b.type === "QUESTION");

      const idOf2ndPointerInMaliciousQuestion = _.get(
        maliciousQuestionBlock,
        "value[0].nodes[3].data.pointerId",
      );

      if (!idOf2ndPointerInMaliciousQuestion) {
        throw Error(
          `Slate structure of malicious question incorrect:
          idOf2ndPointerInMaliciousQuestion: ${idOf2ndPointerInMaliciousQuestion}`,
        );
      }

      return idOf2ndPointerInMaliciousQuestion;
    })();
  }

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.STRING, ["id"]))
  public get idOfMaliciousAnswerCandidate() {
    return (async () => {
      const workspace = await Workspace.findByPk(this.get("id") as string);

      const isExpertWorkspace =
        workspace.isEligibleForMaliciousOracle ||
        (workspace.isEligibleForHonestOracle &&
          !workspace.isAwaitingHonestExpertDecision);

      if (isExpertWorkspace) {
        return;
      }

      // The pointer containing the malicious answer candidate
      // first appears in the judge question. But to distinguish
      // it from the honest answer candidate, we need to know which pointer
      // contains the honest answer candidate, and this first appears in the
      // malicious question.
      const maliciousWorkspace = await Workspace.findByPk(workspace.parentId);

      const maliciousQuestionBlock = (await maliciousWorkspace.$get(
        "blocks",
      )).find(b => b.type === "QUESTION");

      const idOf2ndPointerInMaliciousQuestion = _.get(
        maliciousQuestionBlock,
        "value[0].nodes[3].data.pointerId",
      );

      const idOfHonestAnswerCandidatePointer = idOf2ndPointerInMaliciousQuestion;

      const judgeQuestionBlock = (await workspace.$get("blocks")).find(
        b => b.type === "QUESTION",
      );

      const idOfA1AnswerCandidate = _.get(
        judgeQuestionBlock,
        "value[0].nodes[3].data.pointerId",
      );

      const idOfA2AnswerCandidate = _.get(
        judgeQuestionBlock,
        "value[0].nodes[5].data.pointerId",
      );

      if (!idOfA1AnswerCandidate || !idOfA2AnswerCandidate) {
        throw Error(
          `Slate structure of judge question incorrect:
          idOfA1AnswerCandidate: ${idOfA1AnswerCandidate},
          idOfA2AnswerCandidate: ${idOfA2AnswerCandidate}`,
        );
      }

      const idOfMaliciousAnswerCandidatePointer =
        idOfHonestAnswerCandidatePointer === idOfA1AnswerCandidate
          ? idOfA2AnswerCandidate
          : idOfA1AnswerCandidate;

      return idOfMaliciousAnswerCandidatePointer;
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
        order: [["createdAt", "ASC"]],
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

  @HasMany(() => Assignment)
  public assignments: Assignment[];

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
    // Every workspace gets a question block and a scratchpad block.
    if (questionValue) {
      await workspace.$create("block", {
        type: "QUESTION",
        value: questionValue,
      });
    } else {
      await workspace.$create("block", { type: "QUESTION" });
    }
    await workspace.$create("block", { type: "SCRATCHPAD" });

    // Every workspace also gets an answer and answer draft block.
    // In the case of the root workspace, however, the answer draft
    // block gets default content, so creating this block has to be customized
    // relative to the workspace type.
    await workspace.$create("block", { type: "ANSWER" });

    // Every workspace gets a subquesiton draft block, even though
    // expert workspaces don't use it. This is because other parts of the
    // codebase assume every workspace has a subuqestion draft block.
    // TODO: Look into whether we could remove these assumptions and avoid
    // creating a subquestion draft block for expert workspaces.
    await workspace.$create("block", { type: "SUBQUESTION_DRAFT" });

    // Not every workspace gets an oracle answer candidate block.
    // Only non-root expert workspaces.
    if (workspace.isRequestingLazyUnlock) {
      await workspace.$create("block", {
        type: "ANSWER_DRAFT",
      });
    } else if (
      workspace.isEligibleForHonestOracle &&
      isInOracleMode.getValue()
    ) {
      await workspace.$create("block", {
        type: "ORACLE_ANSWER_CANDIDATE",
      });
      await workspace.$create("block", {
        type: "ANSWER_DRAFT",
      });
    } else if (
      workspace.isEligibleForMaliciousOracle &&
      isInOracleMode.getValue()
    ) {
      if (workspace.parentId) {
        await workspace.$create("block", {
          type: "ORACLE_ANSWER_CANDIDATE",
        });
        await workspace.$create("block", {
          type: "ANSWER_DRAFT",
        });
      } else {
        const { answerDraftBlockValue } = createDefaultRootLevelBlockValues();
        await workspace.$create("block", {
          type: "ANSWER_DRAFT",
          value: answerDraftBlockValue,
        });
      }
    } else {
      // This "else" means it's a judge workspace.
      await workspace.$create("block", {
        type: "ANSWER_DRAFT",
      });
    }
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
            rootWorkspaceId: workspace.isRootWorkspace()
              ? workspace.id
              : workspace.rootWorkspaceId,
          });
        }),
      );
    }
  }

  public static findByPkOrSerialId(pkOrSerialId) {
    if (!pkOrSerialId || !pkOrSerialId.length) {
      return;
    }

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

    const rootWorkspace = await parentWorkspace.getRootWorkspace();
    const tree = (await rootWorkspace.$get("tree")) as Tree;
    const isMIBWithoutRestarts = tree.isMIBWithoutRestarts;

    const isParentRootWorkspace = !parentWorkspace.parentId;
    const isParentHonestOracleWorkspace =
      parentWorkspace.isEligibleForHonestOracle;
    const isParentMaliciousOracleWorkspace =
      parentWorkspace.isEligibleForMaliciousOracle;

    // child of honest workspace never honest
    if (isParentHonestOracleWorkspace) {
      return false;
    }

    const experiments = (await tree.$get("experiments")) as Experiment[];

    if (experiments.length === 0) {
      return false;
    }

    const mostRecentExperiment = _.sortBy(experiments, e => -e.createdAt)[0];

    // if experiment is non-oracle, then of course not honest
    if (!mostRecentExperiment.areNewWorkspacesOracleOnlyByDefault) {
      return false;
    }

    // if parent is root, then honest
    if (isParentRootWorkspace) {
      return true;
    }

    // if parent is non-root malicious, and MIB w/o restarts, then honest
    if (isParentMaliciousOracleWorkspace && isMIBWithoutRestarts) {
      return true;
    }

    // If parent is non-expert, then honest
    if (!isParentMaliciousOracleWorkspace && !isParentHonestOracleWorkspace) {
      return true;
    }

    // Else not honest
    return false;
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
    let isAwaitingHonestExpertDecision;

    if (shouldOverrideToNormalUser) {
      isEligibleForHonestOracle = false;
      isEligibleForMaliciousOracle = false;
      isAwaitingHonestExpertDecision = false;
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

      const parentWorkspace = await Workspace.findByPkOrSerialId(parentId);
      const rootWorkspace = await parentWorkspace.getRootWorkspace();
      const tree = (await rootWorkspace.$get("tree")) as Tree;
      const isMIBWithoutRestarts = tree.isMIBWithoutRestarts;

      if (isMIBWithoutRestarts) {
        isAwaitingHonestExpertDecision = !!(
          isEligibleForHonestOracle &&
          parentWorkspace &&
          parentWorkspace.isEligibleForMaliciousOracle &&
          parentWorkspace.parentId
        ); // parent is non-root
      } else {
        isAwaitingHonestExpertDecision = false;
      }
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
        isAwaitingHonestExpertDecision,
      },
      { questionValue: question },
    );
  }

  public isRootWorkspace(): boolean {
    return this.rootWorkspaceId === null;
  }

  public async getRootWorkspace() {
    if (this.isRootWorkspace()) {
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
