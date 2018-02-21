'use strict';

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  var WorkspaceVersion = sequelize.define('WorkspaceVersion', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    }
  });
  WorkspaceVersion.associate = function (models) {
    WorkspaceVersion.Workspace = WorkspaceVersion.belongsTo(models.Workspace, { foreignKey: 'workspaceId' });
    WorkspaceVersion.QuestionBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'questionBlockVersion', foreignKey: 'questionVersionId' });
    WorkspaceVersion.AnswerBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'answerBlockVersion', foreignKey: 'answerVersionId' });
    WorkspaceVersion.ScratchpadBlockVersion = WorkspaceVersion.belongsTo(models.BlockVersion, { as: 'scratchpadBlockVersion', foreignKey: 'scratchpadVersionId' });
  };
  return WorkspaceVersion;
};