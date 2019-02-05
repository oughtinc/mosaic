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

    await queryInterface.createTable("FallbackRelation", {
      ...standardColumns,
      primaryExperimentId: referenceTo("Experiments"),
      fallbackExperimentId: referenceTo("Experiments"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("FallbackRelation");
  }
};
