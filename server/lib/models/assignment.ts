import { UUIDV4 } from "sequelize";
import {
  Column,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  BeforeValidate,
  DataType,
  BeforeUpdate
} from "sequelize-typescript";
import EventModel from "./event";
import Workspace from "./workspace";
import Experiment from "./experiment";

@Table({ tableName: "Assignments" })
export default class Assignment extends Model<Assignment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @Column(DataType.STRING)
  public userId: string;

  @Column(DataType.BIGINT)
  public startAtTimestamp: number;

  @Column(DataType.BIGINT)
  public endAtTimestamp: number;

  @Column(DataType.BOOLEAN)
  public isOracle: boolean;

  @Column(DataType.BOOLEAN)
  public isTimed: boolean;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public workspaceId: string;

  @BelongsTo(() => Workspace)
  public Workspace: Workspace;

  @ForeignKey(() => Experiment)
  @Column(DataType.UUID)
  public experimentId: string;

  @BelongsTo(() => Experiment)
  public Experiments: Experiment;

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
  public static updateEvent(item: Assignment, options: { event?: EventModel }) {
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
    item: Assignment,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }
}
