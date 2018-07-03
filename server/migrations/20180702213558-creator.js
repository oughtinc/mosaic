'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'creatorId', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      }
    );
    await queryInterface.addColumn(
      'Workspaces',
      'public', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
  },
  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'creatorId');
    await queryInterface.removeColumn('Workspaces', 'public');
  }
}