'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "isArchived", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "isArchived");
  }
};
