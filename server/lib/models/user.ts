import {
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import { UUIDV4 } from "sequelize";
import Tree from "./tree";
import UserTreeOracleRelation from "./userTreeOracleRelation";

@Table({ tableName: "Users" })
export default class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @Column(DataType.STRING)
  public familyName: string;

  @Column(DataType.STRING)
  public givenName: string;

  @Column(DataType.STRING)
  public email: string;

  @Column(DataType.STRING)
  public gender: string;

  @Column(DataType.STRING)
  public pictureURL: string;

  @BelongsToMany(() => Tree, () => UserTreeOracleRelation)
  public OracleTrees: Tree[];

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
  public static updateEvent(item: User, options: { event?: EventModel }) {
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
    item: User,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }
}
