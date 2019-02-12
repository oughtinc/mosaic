"use strict";
 module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Experiments", "metadata", {
      type: Sequelize.JSON,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experiments", "metadata");
  }
};
