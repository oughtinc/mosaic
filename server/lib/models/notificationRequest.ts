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
import getScheduler from "../scheduler";

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

  public static async findAllWithWorkAvailable() {
    // Notification system disabled
    // return await NotificationRequest.findAll({ include: [User, Experiment] })
    //   .then(notificationRequests =>
    //     notificationRequests.filter(notificationRequest =>
    //       notificationRequest.experiment.isActive(),
    //     ),
    //   )
    //   .then(notificationRequests =>
    //     Promise.all(
    //       notificationRequests.map(async notificationRequest => [
    //         notificationRequest,
    //         await notificationRequest.isWorkAvailable(),
    //       ]),
    //     ),
    //   )
    //   .then(requestPendingPairs =>
    //     requestPendingPairs.filter(([_, isWorkPending]) => isWorkPending),
    //   )
    //   .then(requestPendingPairs =>
    //     requestPendingPairs.map(
    //       ([notificationRequest, _]) => notificationRequest,
    //     ),
    //   );
  }

  public async isWorkAvailable() {
    // Notification system disabled
    // const scheduler = await getScheduler(this.experimentId);
    // return scheduler.isWorkspaceAvailable(this.userId);
  }
}
