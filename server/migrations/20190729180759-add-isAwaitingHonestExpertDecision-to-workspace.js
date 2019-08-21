"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Workspaces",
      "isAwaitingHonestExpertDecision",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    );
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "Workspaces",
      "isAwaitingHonestExpertDecision",
    );
  },
};
