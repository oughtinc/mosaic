'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'creatorId', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "auth0|5b3e6d23f3d20a5de662cf84" // andreas@ought
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