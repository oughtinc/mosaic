'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'totalBudget',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );
    await queryInterface.addColumn(
      'Workspaces',
      'allocatedBudget',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'totalBudget');
    await queryInterface.removeColumn('Workspaces', 'allocatedBudget');
  }
};