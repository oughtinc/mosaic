'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Assignments", "createdAtEventId");
    await queryInterface.removeColumn("Assignments", "updatedAtEventId");
    await queryInterface.removeColumn("Blocks", "createdAtEventId");
    await queryInterface.removeColumn("Blocks", "updatedAtEventId");
    await queryInterface.removeColumn("Experiments", "createdAtEventId");
    await queryInterface.removeColumn("Experiments", "updatedAtEventId");
    await queryInterface.removeColumn("ExperimentTreeRelation", "createdAtEventId");
    await queryInterface.removeColumn("ExperimentTreeRelation", "updatedAtEventId");
    await queryInterface.removeColumn("ExportWorkspaceLockRelations", "createdAtEventId");
    await queryInterface.removeColumn("ExportWorkspaceLockRelations", "updatedAtEventId");
    await queryInterface.removeColumn("FallbackRelation", "createdAtEventId");
    await queryInterface.removeColumn("FallbackRelation", "updatedAtEventId");
    await queryInterface.removeColumn("Pointers", "createdAtEventId");
    await queryInterface.removeColumn("Pointers", "updatedAtEventId");
    await queryInterface.removeColumn("PointerImports", "createdAtEventId");
    await queryInterface.removeColumn("PointerImports", "updatedAtEventId");
    await queryInterface.removeColumn("Trees", "createdAtEventId");
    await queryInterface.removeColumn("Trees", "updatedAtEventId");
    await queryInterface.removeColumn("Users", "createdAtEventId");
    await queryInterface.removeColumn("Users", "updatedAtEventId");
    await queryInterface.removeColumn("UserTreeOracleRelation", "createdAtEventId");
    await queryInterface.removeColumn("UserTreeOracleRelation", "updatedAtEventId");
    await queryInterface.removeColumn("Workspaces", "createdAtEventId");
    await queryInterface.removeColumn("Workspaces", "updatedAtEventId");
    await queryInterface.removeColumn("WorkspaceStateCache", "createdAtEventId");
    await queryInterface.removeColumn("WorkspaceStateCache", "updatedAtEventId");
    await queryInterface.dropTable("Events");
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("Events", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      lastEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      }
    });

    const reAddColumns = async (tableName) => {
      await queryInterface.addColumn(tableName, "createdAtEventId", {
          type: Sequelize.INTEGER,
          references: {
            model: "Events",
            key: "id"
          }
        }
      );

      await queryInterface.addColumn(tableName, "createdAtEventId", {
          type: Sequelize.INTEGER,
          references: {
            model: "Events",
            key: "id"
          }
        }
      );
    };

    await reAddColumns("Assignments");
    await reAddColumns("Blocks");
    await reAddColumns("Experiments");
    await reAddColumns("ExportWorkspaceLockRelations");
    await reAddColumns("Pointers");
    await reAddColumns("PointerImports");
    await reAddColumns("Trees");
    await reAddColumns("Users");
    await reAddColumns("UserTreeOracleRelations");
    await reAddColumns("Workspaces");
  }
};
