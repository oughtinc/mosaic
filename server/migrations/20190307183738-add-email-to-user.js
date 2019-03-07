"use strict";
 module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "email", {
      type: Sequelize.STRING,
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "email");
  }
};
