"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Trees", "doesAllowOracleBypass", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Trees", "doesAllowOracleBypass");
  },
};
