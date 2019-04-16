import { UUIDV4 } from "sequelize";
import {
  Column,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Workspace from "./workspace";
import Experiment from "./experiment";

@Table
export default class Assignment extends Model<Assignment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
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
}
