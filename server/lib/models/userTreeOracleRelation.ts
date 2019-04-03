import {
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column, DataType,
  Default,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import User from "./user";
import Tree from "./tree";

@Table
export default class UserTreeOracleRelation extends Model<
  UserTreeOracleRelation
> {
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isMalicious: boolean;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public UserId: string;

  @BelongsTo(() => User)
  public user: User;

  @ForeignKey(() => Tree)
  @Column(DataType.UUID)
  public TreeId: string;

  @BelongsTo(() => Tree)
  public tree: User;

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
    item: UserTreeOracleRelation,
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
    item: UserTreeOracleRelation,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }
}
