"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Trees", "isMIBWithoutRestarts", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Trees", "isMIBWithoutRestarts");
  },
};
