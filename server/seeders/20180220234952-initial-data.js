'use strict';
var models = require('../lib/models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const workspace = await models.Workspace.create()
  },

  down: (queryInterface, Sequelize) => {
  }
};
