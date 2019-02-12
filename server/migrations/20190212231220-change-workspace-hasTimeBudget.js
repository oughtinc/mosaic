"use strict";

// changing an already existing enum with a Sequelize migration
// is non-trivial, and I modeleded this migration off the following:
// https://github.com/sequelize/sequelize/issues/7151#issuecomment-380429781

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Workspaces", "hasIOConstraints", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Workspaces", "hasIOConstraints", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
};
