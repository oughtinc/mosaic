'use strict';
var models = require('../lib/models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const event = await models.Event.create()
    console.log(event)
    const workspace = await models.Workspace.create({
      createdAtEventId: event.dataValues.id,
      updatedAtEventId: event.dataValues.id
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
