"use strict";
 module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Experiments", "eligibilityRank", {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experiments", "eligibilityRank");
  }
};
