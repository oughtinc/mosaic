import { Op, UUIDV4 } from "sequelize";
import { getAllInlinesAsArray } from "../utils/slateUtils";
import * as _ from "lodash";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import Block from "./block";
import PointerImport from "./pointerImport";

@Table
export default class Pointer extends Model<Pointer> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  // @ts-ignore
  @Column(new DataType.VIRTUAL(DataType.JSON, ["id", "sourceBlockId"]))
  public get value() {
    return (async () => {
      if (this.cachedValue !== null) {
        return this.cachedValue;
      }

      // look into removing the rest of this method
      // and related code (pulling in "id" and "sourceBlockId" attributes)
      // as well as the Block cachedExportPointerValues
      const pointerId = this.get("id") as string;
      const sourceBlockId = this.get("sourceBlockId") as string;
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

  public async containedPointers({
    pointersSoFar,
  }: { pointersSoFar?: Pointer[] } = {}) {
    const directPointers = await this.directContainedPointers({
      pointersSoFar,
    });
    const allPointers: any = [...directPointers];
    for (const pointer of allPointers) {
      const directImports = await pointer.directContainedPointers({
        pointersSoFar: _.join(allPointers, pointersSoFar),
      });
      directImports
        .filter(p => !_.includes(allPointers.map(p => p.id), p.id))
        .forEach(p => {
          allPointers.push(p);
        });
    }
    return allPointers;
  }

  public async directContainedPointers({
    pointersSoFar,
  }: { pointersSoFar?: Pointer[] } = {}) {
    let pointerIds = await this.directContainedPointerIds();
    if (pointersSoFar) {
      pointerIds = _.difference(
        pointerIds,
        _.map(pointersSoFar, _.property("id")),
      );
    }

    return await Pointer.findAll({
      where: {
        id: {
          [Op.in]: _.uniq(pointerIds),
        },
      },
    });
  }

  public async directContainedPointerIds() {
    const value = await this.value;
    if (!value) {
      return [];
    }

    const inlines = getAllInlinesAsArray(value);
    const pointerInlines = inlines.filter(l => !!l.data.pointerId);
    return pointerInlines.map(p => p.data.pointerId);
  }
}
