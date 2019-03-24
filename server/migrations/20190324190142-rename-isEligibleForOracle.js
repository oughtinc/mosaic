"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.renameColumn("Workspaces", "isEligibleForOracle", "isEligibleForHonestOracle");
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.renameColumn("Workspaces", "isEligibleForHonestOracle", "isEligibleForOracle");
  }
};
