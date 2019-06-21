import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import Workspace from "./workspace";

@Table
export default class Snapshot extends Model<Snapshot> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public workspaceId: string;

  @BelongsTo(() => Workspace)
  public Workspace: Workspace;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public userId: string;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public assignmentId: string;

  @Column({ type: DataType.STRING })
  public actionType: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  public snapshot: any;
}
