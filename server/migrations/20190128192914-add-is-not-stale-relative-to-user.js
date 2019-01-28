'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "isNotStaleRelativeToUser", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "isNotStaleRelativeToUser");
  }
};
