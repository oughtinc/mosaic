'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'creatorId', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      }
    );
  },
  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'creatorId');
  }
}