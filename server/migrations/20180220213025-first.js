
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
    }

    await queryInterface.createTable('Events', {
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
      lastEventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id"
        }
      }
    })

    await queryInterface.createTable('Workspaces', {
      ...standardColumns,
    })

    await queryInterface.createTable('WorkspaceVersions', {
      ...standardColumns,
      workspaceId: referenceTo("Workspaces"),
    })

    await queryInterface.createTable('Links', {
      ...standardColumns,
      workspaceVersionId: referenceTo("WorkspaceVersions"),
      kind: Sequelize.STRING,
    })

    await queryInterface.createTable('Nodes', {
      ...standardColumns,
    })

    await queryInterface.createTable('Hypertexts', {
      ...standardColumns,
      content: Sequelize.JSON,
    })

    await queryInterface.createTable('NodeVersion', {
      ...standardColumns,
      nodeId: referenceTo("Nodes"),
      hypertextId: referenceTo("Hypertexts"),
    })

  },

  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events')
    await queryInterface.dropTable('Workspaces')
    await queryInterface.dropTable('WorkspaceVersions')
    await queryInterface.dropTable('Links')
    await queryInterface.dropTable('Hypertexts')
    await queryInterface.dropTable('Nodes')
    await queryInterface.dropTable('NodeVersions')
  }
};
