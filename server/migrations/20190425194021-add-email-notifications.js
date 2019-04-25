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
        references: {
          model: "Experiments",
          key: "id",
        }
      },
      userId: {
        type: Sequelize.STRING,
        references: {
          model: "Users",
          key: "id",
        }
      },
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable("NotificationRequests");
  }
};
