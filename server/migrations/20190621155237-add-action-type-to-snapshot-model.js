"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Snapshots", "actionType", {
      type: Sequelize.STRING,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Snapshots", "actionType");
  },
};
