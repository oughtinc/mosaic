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
    value: {
      type: DataTypes.JSON(),
      allowNull: false
    },
    cachedImportPointerValues: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: false
    },
    cachedExportPointerValues: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: false
    }
  });

  BlockVersion.associate = function (models) {
    BlockVersion.Transaction = BlockVersion.hasOne(models.Transaction, { as: 'transaction', foreignKey: "transactionId" })
    BlockVersion.Block = BlockVersion.belongsTo(models.Block, { foreignKey: 'blockId' })
    BlockVersion.WorkspaceImportPointerVersions = BlockVersion.hasMany(models.WorkspaceImportPointerVersion, { as: 'workspaceImportPointerVersions', foreignKey: 'blockVersionId' })
  }

  BlockVersion.prototype.calculateImportCacheFromValue = async function (oldBlockVersion) {
    return [
      {
        id: "12345",
      },
      {
        id: "abcdefg",
      }
    ]
  }

  BlockVersion.prototype.calculateExportCacheFromValue = async function (oldBlockVersion) {
    return [
      {
        id: "3f3f3f",
        value: "sdfsdf ${sdfsfdd}",
        isDeleted: false,
        importedPointerIds: [
          "3sfesdfd"
        ]
      }
    ]
  }

  BlockVersion.prototype.importCacheDifference = async function (oldBlockVersion) {
    const oldCache = oldBlockVersion.calculateImportCacheFromValue()
    const newCache = this.calculateImportCacheFromValue()

    return {
      deletions: [
        {
          id: "33f3",
          value: false,
          isDeleted: false,
        }
      ],
      additions: [
        {
          id: 'w3f3wf',
          needsSourceCache: true
        }
      ]
    }
  }

  BlockVersion.prototype.exportCacheDifference = async function (oldBlockVersion) {
    const oldCache = oldBlockVersion.calculateExportCacheFromValue()
    const newCache = this.calculateExportCacheFromValue()
    return {
      updates: [
        {
          id: "3f3f3",
          isDeleted: true,
          value: false,
        },
        {
          id: "3f3f3f",
          isDeleted: false,
          value: "sdfsdf $a1",
          importedPointerIds: [
            "a1"
          ]
        }
      ]
    }
  }

  BlockVersion.prototype.cacheDifference = async function (oldBlockVersion) {
    const cacheChanges = {
      imports: this.importCacheDifference(oldBlockVersion),
      exports: this.exportCacheDifference(oldBlockVersion)
    }
    return cacheChanges;
  }

  return BlockVersion;
};
