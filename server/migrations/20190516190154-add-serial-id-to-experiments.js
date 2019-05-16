"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface
      .addColumn("Experiments", "serialId", {
        type: Sequelize.INTEGER,
        autoIncrement: true,
      })
      .then(() => queryInterface.addIndex("Experiments", ["serialId"]));
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experiments", "serialId");
  },
};
