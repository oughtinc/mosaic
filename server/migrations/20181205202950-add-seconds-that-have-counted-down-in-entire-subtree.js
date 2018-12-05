'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "secondsThatHaveCountedDownInEntireSubtree", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "secondsThatHaveCountedDownInEntireSubtree");
  }
};
