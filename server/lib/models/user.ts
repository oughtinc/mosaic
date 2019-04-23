import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import Tree from "./tree";
import UserTreeOracleRelation from "./userTreeOracleRelation";

@Table
export default class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
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
}
