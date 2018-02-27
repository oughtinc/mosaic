'use strict';
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  var BlockVersion = sequelize.define('BlockVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    blockId: {
      type: DataTypes.UUID(),
      allowNull: false
    },
    value:  {
        type: DataTypes.JSON(),
        allowNull: false
    },
    cachedImportPointerValues:  {
        type: DataTypes.JSON(),
        defaultValue: {},
        allowNull: false
    },
    cachedExportPointerValues:  {
        type: DataTypes.JSON(),
        defaultValue: {},
        allowNull: false
    }
  });
  BlockVersion.associate = function(models){
    BlockVersion.Transaction = BlockVersion.hasOne(models.Transaction, {as: 'transaction', foreignKey: "transactionId"})
    BlockVersion.Block = BlockVersion.belongsTo(models.Block, {foreignKey: 'blockId'})
    BlockVersion.WorkspaceImportPointerVersions = BlockVersion.hasMany(models.WorkspaceImportPointerVersion, {as:'workspaceImportPointerVersions',  foreignKey: 'blockVersionId'})
  }
  return BlockVersion;
};
