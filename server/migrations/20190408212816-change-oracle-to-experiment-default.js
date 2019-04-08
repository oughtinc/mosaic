'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Experiments", "areNewWorkspacesOracleOnlyByDefault", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Experiments", "areNewWorkspacesOracleOnlyByDefault", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  }
};
