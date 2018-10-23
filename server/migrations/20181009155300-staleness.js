module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Workspaces", "isStale", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Workspaces", "isStale");
  }
};
