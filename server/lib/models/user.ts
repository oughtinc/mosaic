import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Tree from "./tree";
import UserTreeOracleRelation from "./userTreeOracleRelation";
import NotificationRequest from "./notificationRequest";

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

  @Column(DataType.BOOLEAN)
  public isAdmin: boolean;

  @BelongsToMany(() => Tree, () => UserTreeOracleRelation)
  public OracleTrees: Tree[];

  @HasMany(() => NotificationRequest, "userId")
  public notificationRequests: NotificationRequest[];
}
