import { UUIDV4 } from "sequelize";
import {
  Column,
  HasMany,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Workspace from "./workspace";
import Experiment from "./experiment";
import Snapshot from "./snapshot";
import User from "./user";

@Table
export default class Assignment extends Model<Assignment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  public userId: string;

  @BelongsTo(() => User)
  public user: User;

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
  public Experiment: Experiment;

  @HasMany(() => Snapshot)
  public snapshots: Snapshot[];
}
