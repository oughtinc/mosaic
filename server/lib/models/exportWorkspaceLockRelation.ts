import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
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
}
