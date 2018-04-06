'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable('WorkspaceMutations', {
      id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
      },
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
      beginningHash: {
        type: Sequelize.TEXT,
      },
      endingHash: {
        type: Sequelize.TEXT,
      },
      budget: {
        type: Sequelize.INTEGER,
      },
      usageCount: {
        type: Sequelize.INTEGER,
      },
      mutation: {
        type: Sequelize.JSON,
      }
    });
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.dropTable('WorkspaceMutations')
  },
};
