'use strict';

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Workspaces',
      'budget',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workspaces', 'budget');
  }
};
