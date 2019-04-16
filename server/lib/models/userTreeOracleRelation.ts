import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import User from "./user";
import Tree from "./tree";

@Table({ tableName: "UserTreeOracleRelation" })
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
}
