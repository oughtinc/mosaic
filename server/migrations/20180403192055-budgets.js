'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'budget',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'budget');
  }
};
