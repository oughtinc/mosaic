'use strict';
var models = require('../lib/models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const event = await models.Event.create()
    const workspace = await models.Workspace.create({},{event: event})
  },

  down: (queryInterface, Sequelize) => {
  }
};
