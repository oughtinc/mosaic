import { Op, UUIDV4 } from "sequelize";
import { getAllInlinesAsArray } from "../utils/slateUtils";
import * as _ from "lodash";
import {
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import Block from "./block";
import PointerImport from "./pointerImport";
import { HasOne } from "sequelize-typescript/lib/annotations/association/HasOne";

@Table({ tableName: "Pointers" })
export default class Pointer extends Model<Pointer> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @Column(new DataType.VIRTUAL(DataType.JSON, ["id", "sourceBlockId"]))
  public get value() {
    return (async () => {
      if (this.cachedValue !== null) {
        return this.cachedValue;
      }

      // look into removing the rest of this method
      // and related code (pulling in "id" and "sourceBlockId" attributes)
      // as well as the Block cachedExportPointerValues
      const pointerId = this.get("id");
      const sourceBlockId = this.get("sourceBlockId");
      const sourceBlock = await Block.findByPk(sourceBlockId);
      if (sourceBlock === null) {
        return null;
      }
      const { cachedExportPointerValues } = sourceBlock;
      return cachedExportPointerValues[pointerId];
    })();
  }

  @Column(DataType.JSON)
  public cachedValue: Object;

  @HasOne(() => PointerImport)
  public pointerImport: PointerImport;

  @ForeignKey(() => Block)
  @Column(DataType.UUID)
  public sourceBlockId: string;

  @BelongsTo(() => Block)
  public sourceBlock: Block;

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
  public static updateEvent(item: Pointer, options: { event?: EventModel }) {
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
    item: Pointer,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }

  public async containedPointers({ pointersSoFar } = {}) {
    const directPointers = await this.directContainedPointers({
      pointersSoFar
    });
    const allPointers: any = [...directPointers];
    for (const pointer of allPointers) {
      const directImports = await pointer.directContainedPointers({
        pointersSoFar: _.join(allPointers, pointersSoFar)
      });
      directImports
        .filter(p => !_.includes(allPointers.map(p => p.id), p.id))
        .forEach(p => {
          allPointers.push(p);
        });
    }
    return allPointers;
  }

  public async directContainedPointers({ pointersSoFar } = {}) {
    let pointerIds = await this.directContainedPointerIds();
    if (pointersSoFar) {
      pointerIds = _.difference(
        pointerIds,
        _.map(pointersSoFar, _.property("id"))
      );
    }

    const pointers = await Pointer.findAll({
      where: {
        id: {
          [Op.in]: _.uniq(pointerIds)
        }
      }
    });
    return pointers;
  }

  public async directContainedPointerIds() {
    const value = await this.value;
    if (!value) {
      return [];
    }

    const inlines = getAllInlinesAsArray(value);
    const pointerInlines = inlines.filter(l => !!l.data.pointerId);
    const pointerIds = pointerInlines.map(p => p.data.pointerId);
    return pointerIds;
  }
}
