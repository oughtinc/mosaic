"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Trees", "depthLimit", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 6,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Trees", "depthLimit");
  },
};
