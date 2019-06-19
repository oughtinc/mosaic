"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ID_TYPE = Sequelize.UUID;

    const ID = {
      allowNull: false,
      primaryKey: true,
      type: ID_TYPE,
    };

    const referenceTo = target => ({
      type: ID_TYPE,
      references: {
        model: target,
        key: "id",
      },
    });

    const referenceToUser = target => ({
      type: Sequelize.STRING,
      references: {
        model: target,
        key: "id",
      },
    });

    const standardColumns = {
      id: ID,
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    };

    await queryInterface.createTable("Snapshots", {
      ...standardColumns,
      userId: referenceToUser("Users"),
      workspaceId: referenceTo("Workspaces"),
      snapshot: {
        type: Sequelize.JSON,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Snapshots");
  },
};
