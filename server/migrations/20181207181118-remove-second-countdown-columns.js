'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "secondsThatHaveCountedDown");
    await queryInterface.removeColumn("Workspaces", "secondsThatHaveCountedDownInEntireSubtree");
  },

  down: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "secondsThatHaveCountedDown", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn("Workspaces", "secondsThatHaveCountedDownInEntireSubtree", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};
