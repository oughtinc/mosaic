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
    cachedImportPointerIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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

  const UPDATABLE_VALUES = ['value', 'cachedImportPointerIds', 'cachedExportPointerValues']

  BlockVersion.createAndUpdateCaches = async function (newVersion) {
    const newBlockVersion = await sequelize.models.BlockVersion.build(_.pick(newValue, UPDATABLE_VALUES))
    newBlockVersion.cachedImportPointerIds = this.valueToImportPointerIds()
    newBlockVersion.cachedExportPointerValues = this.valueToExportPointerValues()
    await newBlockVersion.save()
    return newBlockVersion
  }

  BlockVersion.prototype.valueToImportPointerIds = async function () {
    //TODO: DO this one
    return ["s8fj", "sdfsdf", "sfdsdf"]
  }

  BlockVersion.prototype.valueToExportPointerValues = async function () {
    //TODO: DO this one
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

  BlockVersion.prototype.cachedExportPointerValuesDifference = async function (oldBlockVersion) {
    return [
      {
        pointerId: "3f3f3",
        pointerVersionId: "3f3f3f",
        isDeleted: true,
        value: false,
      },
      {
        pointerId: "sdfsdf",
        pointerVersionId: "3f3f3f",
        isDeleted: false,
        value: "sdfsdf $a1",
        importedPointerIds: [
          "a1"
        ]
      }
    ]
  }

  return BlockVersion;
};
