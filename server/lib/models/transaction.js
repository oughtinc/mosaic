'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER(),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  })
  Transaction.associate = function(models){
  }
  return Transaction
}