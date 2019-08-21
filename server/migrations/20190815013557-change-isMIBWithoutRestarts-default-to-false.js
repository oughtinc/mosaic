"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Trees", "isMIBWithoutRestarts", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Trees", "isMIBWithoutRestarts", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
