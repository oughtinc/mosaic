'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Experiments", "areNewWorkspacesOracleOnlyByDefault", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experiments", "areNewWorkspacesOracleOnlyByDefault");
  }
};
