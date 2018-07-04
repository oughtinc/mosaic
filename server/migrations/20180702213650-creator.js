'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'creatorId', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "auth0|5b3c1708f2e63b278002fc6c" // Mosaic-2
      }
    );
    await queryInterface.addColumn(
      'Workspaces',
      'isPublic', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    );
  },
  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'creatorId');
    await queryInterface.removeColumn('Workspaces', 'isPublic');
  }
}