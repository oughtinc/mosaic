"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Snapshots", "assignmentId", {
      type: Sequelize.UUID,
      references: {
        model: "Assignments",
        key: "id",
      },
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Snapshots", "assignmentId");
  },
};
