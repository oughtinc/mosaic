'use strict';

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  var BlockVersion = sequelize.define('BlockVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    blockId: {
      type: DataTypes.UUID(),
      allowNull: false
    },
    value: {
      type: DataTypes.JSON(),
      allowNull: false
    }
  });
  BlockVersion.associate = function (models) {
    BlockVersion.Block = BlockVersion.belongsTo(models.Block, { foreignKey: 'blockId' });
  };
  return BlockVersion;
};