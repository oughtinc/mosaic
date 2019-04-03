import {
  AllowNull,
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import { UUIDV4 } from "sequelize";
import Workspace from "./workspace";
import Pointer from "./pointer";

@Table({ tableName: "ExportWorkspaceLockRelations" })
export default class ExportWorkspaceLockRelation extends Model<
  ExportWorkspaceLockRelation
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isLocked: boolean;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public workspaceId: string;

  @BelongsTo(() => Workspace)
  public Workspace: Workspace;

  @ForeignKey(() => Pointer)
  @Column(DataType.UUID)
  public pointerId: string;

  @BelongsTo(() => Pointer)
  public Export: Pointer;

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
  public static updateEvent(
    item: ExportWorkspaceLockRelation,
    options: { event?: EventModel }
  ) {
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
    item: ExportWorkspaceLockRelation,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }
}
