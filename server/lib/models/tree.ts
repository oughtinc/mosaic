import {
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import EventModel from "./event";
import Experiment from "./experiment";
import Workspace from "./workspace";
import UserTreeOracleRelation from "./userTreeOracleRelation";
import User from "./user";
import ExperimentTreeRelation from "./experimentTreeRelation";

@Table({ tableName: "Trees" })
export default class Tree extends Model<Tree> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public rootWorkspaceId: string;

  @BelongsTo(() => Workspace)
  public rootWorkspace: Workspace;

  @BelongsToMany(() => Experiment, () => ExperimentTreeRelation)
  public experiments: Experiment[];

  @HasMany(() => UserTreeOracleRelation)
  public oracleRelations: UserTreeOracleRelation[];

  @BelongsToMany(() => User, () => UserTreeOracleRelation)
  public oracles: User[];

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
  public static updateEvent(item: Tree, options: { event?: EventModel }) {
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
    item: Tree,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }
}
