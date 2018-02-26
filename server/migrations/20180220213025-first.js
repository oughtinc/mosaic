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
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    }

    await queryInterface.createTable('Blocks', {
      id: ID,
      ...standardColumns,
    });

    await queryInterface.createTable('BlockVersions', {
      id: ID,
      ...standardColumns,
      blockId: referenceTo("Blocks"),
      value: Sequelize.JSON
    });

    await queryInterface.createTable('Workspaces', {
      id: ID,
      ...standardColumns,
      parentId: referenceTo("Workspaces"),
      questionId: referenceTo("Blocks"),
      answerId: referenceTo("Blocks"),
      scratchpadId: referenceTo("Blocks")
    });

    await queryInterface.createTable('Pointers', {
      id: ID,
      sourceBlockId: referenceTo("Blocks"),
    });

    await queryInterface.createTable('WorkspacePointersCollectionVersions', {
      id: ID,
      workspaceId: referenceTo("Workspaces"),
    });

    await queryInterface.createTable('WorkspacePointerInputVersions', {
      id: ID,
      isExpanded: Sequelize.BOOLEAN,
      pointerId: referenceTo("Pointers"),
      blockVersionId: referenceTo("BlockVersions"),
      workspacePointersCollectionVersionId: referenceTo("WorkspacePointersCollectionVersions")
    });

    await queryInterface.createTable('WorkspaceVersions', {
      id: ID,
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
    await queryInterface.dropTable('WorkspaceVersions');
    await queryInterface.dropTable('Workspaces');
    await queryInterface.dropTable('BlockVersions');
    await queryInterface.dropTable('Blocks');
  }
};
