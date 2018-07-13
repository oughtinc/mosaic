"use strict";

module.exports = {
  up: async function(queryInterface, Sequelize) {
    var ID_TYPE = Sequelize.UUID;

    var ID = {
      allowNull: false,
      primaryKey: true,
      type: ID_TYPE
    };

    var referenceTo = target => ({
      type: ID_TYPE,
      references: {
        model: target,
        key: "id"
      }
    });

    const standardColumns = {
      id: ID,
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

    await queryInterface.createTable("Workspaces", {
      ...standardColumns,
      parentId: referenceTo("Workspaces"),
      childWorkspaceOrder: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      hasBeenDeletedByAncestor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    });

    await queryInterface.createTable("Blocks", {
      ...standardColumns,
      workspaceId: referenceTo("Workspaces"),
      type: {
        type: Sequelize.ENUM("QUESTION", "ANSWER", "SCRATCHPAD"),
        allowNull: false
      },
      value: Sequelize.JSON,
      cachedImportPointerIds: Sequelize.ARRAY(Sequelize.STRING),
      cachedExportPointerValues: Sequelize.JSON
    });

    await queryInterface.createTable("WorkspaceStateCache", {
      ...standardColumns,
      workspaceId: referenceTo("Workspaces"),
      cache: Sequelize.JSON
    });

    await queryInterface.createTable("Pointers", {
      ...standardColumns,
      sourceBlockId: referenceTo("Blocks")
    });

    await queryInterface.createTable("PointerImports", {
      ...standardColumns,
      isLocked: Sequelize.BOOLEAN,
      pointerId: referenceTo("Pointers"),
      workspaceId: referenceTo("Workspaces")
    });
  },

  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable("Events");
    await queryInterface.dropTable("Blocks");
    await queryInterface.dropTable("Workspaces");
    await queryInterface.dropTable("WorkspaceStateCache");
    await queryInterface.dropTable("Pointers");
    await queryInterface.dropTable("PointerImports");
  }
};
