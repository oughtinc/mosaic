import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";

@Table({ modelName: "Event", tableName: "Events" })
export default class EventModel extends Model<EventModel> {
  @ForeignKey(() => EventModel)
  @Column(DataType.INTEGER)
  public lastEventId: number;

  @BelongsTo(() => EventModel)
  public LastEvent: Event;

  @BeforeCreate
  public static async setLastEventIdOnCreate(
    event: EventModel,
    options: Object
  ) {
    const recentEvents = await EventModel.findAll({
      limit: 1,
      order: [["createdAt", "DESC"]]
    });
    if (!!recentEvents.length) {
      event.lastEventId = recentEvents[0].id;
    } else {
      console.error("No event found. Ignore if this is the first event.");
    }
  }
}
