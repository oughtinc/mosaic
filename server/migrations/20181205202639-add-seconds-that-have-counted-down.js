'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "secondsThatHaveCountedDown", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "secondsThatHaveCountedDown");
  }
};
