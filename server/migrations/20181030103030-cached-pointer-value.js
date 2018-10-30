module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pointers", "cachedValue", {
      type: Sequelize.JSON
    });
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pointers", "cachedValue");
  }
};
