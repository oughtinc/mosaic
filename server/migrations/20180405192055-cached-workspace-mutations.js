'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.createTable('CachedWorkspaceMutations', {
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
      beginningRemainingBudget: {
        type: Sequelize.INTEGER,
      },
      endingHash: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('CachedWorkspaceMutations')
  },
};
