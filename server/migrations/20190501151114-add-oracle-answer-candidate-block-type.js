"use strict";

// changing an already existing enum with a Sequelize migration
// is non-trivial, and I modeleded this migration off the following:
// https://github.com/sequelize/sequelize/issues/7151#issuecomment-380429781

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
          "type",
        );

        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      .then(() => {
        return queryInterface.changeColumn("Blocks", "type", {
          type: Sequelize.ENUM(
            "QUESTION",
            "ANSWER",
            "SCRATCHPAD",
            "SUBQUESTION_DRAFT",
            "ANSWER_DRAFT",
            "ORACLE_ANSWER_CANDIDATE",
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
          "type",
        );

        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      .then(() => {
        return queryInterface.changeColumn("Blocks", "type", {
          type: Sequelize.ENUM(
            "QUESTION",
            "ANSWER",
            "SCRATCHPAD",
            "SUBQUESTION_DRAFT",
            "ANSWER_DRAFT",
          ),
          allowNull: false,
        });
      });
  },
};
