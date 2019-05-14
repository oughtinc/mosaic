"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "accessTokens", {
      type: Sequelize.JSON,
      defaultValue: [],
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "accessTokens");
  },
};
