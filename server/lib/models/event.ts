"use strict";

const EventModel = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  },                             {
      hooks: {
        beforeCreate: async (event, options) => {
          const recentEvents = await Event.findAll({
            limit: 1,
            order: [["createdAt", "DESC"]]
          });
          if (!!recentEvents.length) {
            event.lastEventId = recentEvents[0].id;
          } else {

            console.error("No event found. Ignore if this is the first event.");
          }
        }
      },
    });
  Event.associate = function (models) {
    Event.LastEvent = Event.belongsTo(models.Event, { foreignKey: "lastEventId" });
  };
  return Event;
};

export default EventModel;