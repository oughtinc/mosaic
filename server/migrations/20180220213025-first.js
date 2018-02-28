'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    var ID_TYPE = Sequelize.UUID;

    var ID = {
          allowNull: false,
          primaryKey: true,
          type: ID_TYPE
    }

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
      transactionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions",
          key: "id"
        }
      }
    }

    await queryInterface.createTable('Transactions', {
      id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.INTEGER,
          autoIncrement: true,
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    })

    await queryInterface.createTable('Blocks', {
      ...standardColumns,
    })

    await queryInterface.createTable('BlockVersions', {
      ...standardColumns,
      blockId: referenceTo("Blocks"),
      value: Sequelize.JSON,
      cachedOutputPointerValues: Sequelize.JSON,
      cachedImportPointerIds: Sequelize.ARRAY(Sequelize.TEXT),
    })

    await queryInterface.createTable('Workspaces', {
      ...standardColumns,
      parentId: referenceTo("Workspaces"),
      questionId: referenceTo("Blocks"),
      answerId: referenceTo("Blocks"),
      scratchpadId: referenceTo("Blocks")
    })

    await queryInterface.createTable('Pointers', {
      ...standardColumns,
      sourceBlockId: referenceTo("Blocks"),
    })

    await queryInterface.createTable('WorkspacePointersCollectionVersions', {
      ...standardColumns,
      workspaceId: referenceTo("Workspaces"),
    })

    await queryInterface.createTable('WorkspaceImportPointerVersions', {
      ...standardColumns,
      isExpanded: Sequelize.BOOLEAN,
      pointerId: referenceTo("Pointers"),
      blockVersionId: referenceTo("BlockVersions"),
      workspacePointersCollectionVersionId: referenceTo("WorkspacePointersCollectionVersions")
    })

    await queryInterface.createTable('WorkspaceVersions', {
      ...standardColumns,
      childWorkspaceOrder: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      childWorkspaceVersionIds: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      isArchived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      workspaceId: referenceTo("Workspaces"),
      questionVersionId: referenceTo("BlockVersions"),
      answerVersionId: referenceTo("BlockVersions"),
      scratchpadVersionId: referenceTo("BlockVersions"),
      workspacePointersCollectionVersionId: referenceTo("WorkspacePointersCollectionVersions"),
    });
  },

  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions')
    await queryInterface.dropTable('Blocks')
    await queryInterface.dropTable('BlockVersions')
    await queryInterface.dropTable('Workspaces')
    await queryInterface.dropTable('Pointers')
    await queryInterface.dropTable('WorkspacePointersCollectionVersions')
    await queryInterface.dropTable('WorkspaceImportPointerVersions')
    await queryInterface.dropTable('WorkspaceVersions')
  }
};
