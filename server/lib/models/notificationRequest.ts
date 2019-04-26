import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Experiment from "./experiment";
import User from "./user";

@Table
export default class NotificationRequest extends Model<NotificationRequest> {
  @ForeignKey(() => Experiment)
  @AllowNull(false)
  @Column(DataType.UUID)
  public experimentId: string;

  @BelongsTo(() => Experiment)
  public experiment: Experiment;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.STRING)
  public userId: string;

  @BelongsTo(() => User)
  public user: User;
}
