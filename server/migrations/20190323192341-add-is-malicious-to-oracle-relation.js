'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("UserTreeOracleRelation", "isMalicious", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserTreeOracleRelation", "isMalicious");
  }
};
