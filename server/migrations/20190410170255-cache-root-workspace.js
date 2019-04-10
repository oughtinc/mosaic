'use strict';


module.exports = {
  up: async function(queryInterface, Sequelize) {
    async function findRootWorkspaceId(workspaceId) {
      const result = await queryInterface.sequelize.query(
        `SELECT "parentId" FROM "Workspaces" WHERE "id" = :id`,
        {
          replacements: {
            id: workspaceId,
          },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (result.length === 0) {
        return workspaceId;
      }

      const parentId = result[0].parentId;
      if (parentId === null) {
        return workspaceId;
      } else {
        return await findRootWorkspaceId(parentId);
      }
    }

    await queryInterface.addColumn("Workspaces", "rootWorkspaceId", {
      type: Sequelize.UUID,
      references: {
        model: "Workspaces",
        key: "id"
      }
    });

    const workspaces = await queryInterface.sequelize.query(
      `SELECT "id" FROM "Workspaces"`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    await Promise.all(workspaces.map(async ({ id }) => {
      const rootId = await findRootWorkspaceId(id);
      await queryInterface.sequelize.query(
        `UPDATE "Workspaces" SET "rootWorkspaceId" = :rootId`,
        {
          replacements: { rootId },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }));
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "rootWorkspaceId");
  }
};
