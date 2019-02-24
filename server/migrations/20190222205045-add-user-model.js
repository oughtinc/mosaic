'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ID_TYPE = Sequelize.UUID;

    const ID = {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING,
    };

    const standardColumns = {
      id: ID,
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      createdAtEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      },
      updatedAtEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      }
    };

    await queryInterface.createTable("Users", {
      ...standardColumns,
      familyName: Sequelize.STRING,
      givenName: Sequelize.STRING,
      gender: Sequelize.STRING,
      pictureURL: Sequelize.STRING,
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable("User");
  }
};
