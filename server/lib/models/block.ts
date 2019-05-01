import { diff } from "deep-object-diff";
import { getAllInlinesAsArray } from "../utils/slateUtils";
import * as _ from "lodash";
import {
  AfterSave,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  HasMany,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import Workspace from "./workspace";
import Pointer from "./pointer";

const QUESTION_TYPE = "QUESTION"; // move elsewhere?
const ANSWER_TYPE = "ANSWER";
const SCRATCHPAD_TYPE = "SCRATCHPAD";

@Table
export default class Block extends Model<Block> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  @Column({
    type: DataType.ENUM(
      "QUESTION",
      "ANSWER",
      "SCRATCHPAD",
      "SUBQUESTION_DRAFT",
      "ANSWER_DRAFT",
      "ORACLE_ANSWER_CANDIDATE",
    ),
    allowNull: false,
  })
  public type: string;

  @Column(DataType.JSON)
  public value: Object;

  @Column(DataType.JSON)
  public cachedExportPointerValues: Object;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public workspaceId: string;

  @BelongsTo(() => Workspace)
  public workspace: Workspace;

  @HasMany(() => Pointer, "sourceBlockId")
  public exportingPointers: Pointer[];

  @BeforeValidate
  public static async updateCachedExportPointerValues(item: Block) {
    item.cachedExportPointerValues = await item.exportingPointerValues();
  }

  @AfterSave
  public static async updateChangedPoints(item: Block) {
    await item.ensureAllPointersAreInDatabase();
    if (item._previousDataValues) {
      const changes = diff(item._previousDataValues, item.dataValues);
      if (!_.isEmpty(changes.value)) {
        await item.updateStalenessAndIsCurrentlyResolved();
      }
    }
  }

  public async ensureAllPointersAreInDatabase() {
    const exportingPointers = (await this.$get(
      "exportingPointers",
    )) as Pointer[];
    const { cachedExportPointerValues } = this;

    for (const pointerId of Object.keys(cachedExportPointerValues)) {
      if (!_.includes(exportingPointers.map(p => p.id), pointerId)) {
        const pointer = await Pointer.findByPk(pointerId);
        if (!pointer) {
          await this.$create("exportingPointer", { id: pointerId });
        } else {
          // if the pointer already exists,
          // then it was present in the subquestion draft block,
          // and we need to "move" it to the newly created question block
          pointer.update({ sourceBlockId: this.id });
        }
      }
    }
  }

  public async updateStalenessAndIsCurrentlyResolved() {
    const workspaceId = this.workspaceId;
    const workspace = await Workspace.findByPk(workspaceId);
    if (workspace === null) {
      return null;
    }

    // If block is a question
    if (this.type === QUESTION_TYPE) {
      // If it's marked as resolved, then it's going to transition from
      // from resolved to unresolved, so let's take a snapshot of the draft as the answer
      if (workspace.isCurrentlyResolved) {
        const blocks = (await workspace.$get("blocks")) as Block[];
        const answerDraft = blocks.find(b => b.type === "ANSWER_DRAFT");
        const answer = blocks.find(b => b.type === "ANSWER");

        if (answer && answerDraft) {
          await answer.update({ value: answerDraft.value });
        }
      }

      // Mark workspace as stale
      // If it's currently marked as resolved, that it isn't anymore
      return workspace.update({
        isCurrentlyResolved: false,
        isStale: true,
        isNotStaleRelativeToUser: [],
      });
    }
  }

  public async connectedPointers(
    { pointersSoFar }: { pointersSoFar: Pointer[] } = { pointersSoFar: [] },
  ) {
    let pointers = await this.topLevelPointers({ pointersSoFar });
    if (pointersSoFar) {
      pointers = _.differenceBy(pointers, pointersSoFar, "id");
    }

    let allPointers = [...pointers];
    for (const pointer of pointers) {
      const subPointers = await pointer.containedPointers({
        pointersSoFar: _.unionBy(pointersSoFar, allPointers, "id"),
      });
      allPointers = [...allPointers, ...subPointers];
    }
    return _.uniqBy(allPointers, "id");
  }

  // private
  private async topLevelPointers(
    { pointersSoFar }: { pointersSoFar: Pointer[] } = { pointersSoFar: [] },
  ) {
    let topLevelPointerIds = await this.topLevelPointersIds();
    if (pointersSoFar) {
      topLevelPointerIds = _.difference(
        topLevelPointerIds,
        _.map(pointersSoFar, _.property("id")),
      );
    }

    const pointers: any = [];
    for (const id of topLevelPointerIds) {
      const pointer = await Pointer.findByPk(id);
      if (!!pointer) {
        pointers.push(pointer);
      } else {
        console.error(
          `Referenced pointer with ID ${id} not found in database.`,
        );
      }
    }
    return _.uniqBy(pointers, "id");
  }

  private async topLevelPointersIds() {
    if (!this.dataValues.value) {
      return [];
    }
    const _getInlinesAsArray = getAllInlinesAsArray(this.dataValues.value);
    const pointers = _getInlinesAsArray.filter(
      l => l.type === "pointerImport" || l.type === "pointerExport",
    );
    return pointers.map(p => p.data.pointerId);
  }

  private async exportingPointerValues() {
    if (!this.dataValues.value) {
      return {};
    }

    const _getInlinesAsArray = getAllInlinesAsArray(this.dataValues.value);
    const pointers = _getInlinesAsArray.filter(l => l.type === "pointerExport");

    const results = {};
    for (const pointerJSON of pointers) {
      results[pointerJSON.data.pointerId] = pointerJSON;

      const pointer = await Pointer.findByPk(pointerJSON.data.pointerId);

      if (pointer) {
        await pointer.update({ cachedValue: pointerJSON });
      }
    }
    return results;
  }
}
