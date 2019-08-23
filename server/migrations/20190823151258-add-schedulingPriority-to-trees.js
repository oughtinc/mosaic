"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Trees", "schedulingPriority", {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Trees", "schedulingPriority");
  },
};
