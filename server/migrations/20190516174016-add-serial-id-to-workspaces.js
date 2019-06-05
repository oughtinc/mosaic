"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface
      .addColumn("Workspaces", "serialId", {
        type: Sequelize.INTEGER,
        autoIncrement: true,
      })
      .then(() => queryInterface.addIndex("Workspaces", ["serialId"]));
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "serialId");
  },
};
