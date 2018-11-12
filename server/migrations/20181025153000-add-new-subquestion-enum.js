"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface
      .changeColumn("Blocks", "type", {
        type: Sequelize.STRING,
        allowNull: false,
      })
      .then(() => {
        const pgEnumDropQuery = queryInterface.QueryGenerator.pgEnumDrop(
          "Blocks",
          "type"
        );

        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      .then(() => {
        return queryInterface.changeColumn("Blocks", "type", {
          type: Sequelize.ENUM(
            "QUESTION",
            "ANSWER",
            "SCRATCHPAD",
            "SUBQUESTION_DRAFT"
          ),
          allowNull: false,
        });
      });
  },
  down: function down(queryInterface, Sequelize) {
    return queryInterface
      .changeColumn("Blocks", "type", {
        type: Sequelize.STRING,
        allowNull: false,
      })
      .then(() => {
        const pgEnumDropQuery = queryInterface.QueryGenerator.pgEnumDrop(
          "Blocks",
          "type"
        );

        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      .then(() => {
        return queryInterface.changeColumn("Blocks", "type", {
          type: Sequelize.ENUM("QUESTION", "ANSWER", "SCRATCHPAD"),
          allowNull: false,
        });
      });
  },
};
