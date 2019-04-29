'use strict';


module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("NotificationRequests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      experimentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Experiments",
          key: "id",
        }
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        }
      },
    });

    await queryInterface.addConstraint('NotificationRequests', ['userId', 'experimentId'], {
      type: 'unique',
      name: 'only-one-notification-request-per-user-and-experiment'
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable("NotificationRequests");
  }
};
