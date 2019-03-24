'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "isEligibleForMaliciousOracle", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "isEligibleForMaliciousOracle");
  }
};
