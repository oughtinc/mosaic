'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER(),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  })
  Event.associate = function(models){
  }
  return Event
}