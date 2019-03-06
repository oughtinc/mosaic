'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ID_TYPE = Sequelize.UUID;

    const referenceTo = target => ({
      type: ID_TYPE,
      primaryKey: true,
      references: {
        model: target,
        key: "id"
      }
    });

    const referenceToStringId = target => ({
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: target,
        key: "id"
      }
    });

    const standardColumns = {
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      createdAtEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      },
      updatedAtEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      }
    };

    await queryInterface.createTable("UserTreeOracleRelation", {
      ...standardColumns,
      UserId: referenceToStringId("Users"),
      TreeId: referenceTo("Trees"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserTreeOracleRelation");
  }
};
