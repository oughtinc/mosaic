import { UUIDV4 } from "sequelize";
import {
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Pointer from "./pointer";
import Workspace from "./workspace";

@Table({ tableName: "PointerImports" })
export default class PointerImport extends Model<PointerImport> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @Column(DataType.BOOLEAN)
  public isLocked: boolean;

  @ForeignKey(() => Pointer)
  @Column(DataType.UUID)
  public pointerId: string;

  @BelongsTo(() => Pointer)
  public pointer: Pointer;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public workspaceId: string;

  @BelongsTo(() => Workspace)
  public workspace: Workspace;
}
