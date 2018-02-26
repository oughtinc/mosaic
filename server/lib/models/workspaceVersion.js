'use strict';
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  var WorkspaceVersion = sequelize.define('WorkspaceVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    childWorkspaceOrder: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    //This field represents cached data. You can find it from the relevant timestamps.
    childWorkspaceVersionIds: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    //This field represents cached data. You can find it from checking if its in the childWorkspaceOrder of its parent.
    isArchived: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false
    },
  });
  WorkspaceVersion.associate = function(models){
    WorkspaceVersion.Workspace = WorkspaceVersion.belongsTo(models.Workspace, {foreignKey: 'workspaceId'})
    WorkspaceVersion.QuestionBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, {as: 'questionBlockVersion', foreignKey: 'questionVersionId'})
    WorkspaceVersion.AnswerBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, {as: 'answerBlockVersion', foreignKey: 'answerVersionId'})
    WorkspaceVersion.ScratchpadBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, {as: 'scratchpadBlockVersion', foreignKey: 'scratchpadVersionId'})
    WorkspaceVersion.WorkspacePointerCollectionVersion = WorkspaceVersion.belongsTo(models.WorkspacePointerCollectionVersion, {as: 'workspacePointerCollectionVersion', foreignKey: 'workspacePointersCollectionVersionId'})
  }
  return WorkspaceVersion;
};
