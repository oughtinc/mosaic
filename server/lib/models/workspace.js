'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  var Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    }
  }, {
      hooks: {
        beforeCreate: async (workspace, options) => {
          const question = await sequelize.models.Block.create();
          const answer = await sequelize.models.Block.create();
          const scratchpad = await sequelize.models.Block.create();
          workspace.questionId = question.id;
          workspace.answerId = answer.id;
          workspace.scratchpadId = scratchpad.id;
        },
        afterCreate: async (workspace, options) => {
          const question = await workspace.getQuestionBlock();
          const answer = await workspace.getAnswerBlock();
          const scratchpad = await workspace.getScratchpadBlock();

          const questionVersion = await sequelize.models.BlockVersion.create({ blockId: question.id, value: {} });
          const answerVersion = await sequelize.models.BlockVersion.create({ blockId: answer.id, value: {} });
          const scratchpadVersion = await sequelize.models.BlockVersion.create({ blockId: scratchpad.id, value: {} });

          const workspaceVersion = await sequelize.models.WorkspaceVersion.create({
            workspaceId: workspace.id,
            questionVersionId: questionVersion.id,
            answerVersionId: answerVersion.id,
            scratchpadVersionId: scratchpadVersion.id,
          });
        }
      }
    });
  Workspace.associate = function (models) {
    Workspace.WorkspaceVersions = Workspace.hasMany(models.WorkspaceVersion, { as: 'workspaceVersions', foreignKey: 'workspaceId' })
    Workspace.QuestionBlock = Workspace.belongsTo(models.Block, { as: 'questionBlock', foreignKey: 'questionId' })
    Workspace.AnswerBlock = Workspace.belongsTo(models.Block, { as: 'answerBlock', foreignKey: 'answerId' })
    Workspace.ScratchpadBlock = Workspace.belongsTo(models.Block, { as: 'scratchpadBlock', foreignKey: 'scratchpadId' })
  }
  Workspace.prototype.recentWorkspaceVersion = async function () {
    const workspaceVersions = await this.getWorkspaceVersions();
    // console.log("Got recent versions!", workspaceVersions)
    return workspaceVersions[0]
  }
  Workspace.prototype.createWorkspaceVersion = async function (newInputs) {
    const previousWorkspaceVersion = await this.recentWorkspaceVersion();
    const previousValues = _.pick(previousWorkspaceVersion.dataValues, ['questionVersionId', 'answerVersionId', 'scratchpadVersionId'])
    return await sequelize.models.WorkspaceVersion.create({...previousValues, ...newInputs, workspaceId: this.id })
  }
  Workspace.prototype.updateBlockVersions = async function (blockVersions) {
    const recentWorkspaceVersion = await this.recentWorkspaceVersion()
    if (false) {
      throw new Error("Multiple BlockVersions for same blockID")
    }
    if (false) {
      throw new Error("Referenced blockId does not exist on referenced workspace.")
    }
    let newInputs = {};
    for (const blockVersionData of blockVersions) {
      if (this.questionId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["questionVersionId"] = blockVersion.id
      }
      if (this.answerId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["answerVersionId"] = blockVersion.id
      }
      if (this.scratchpadId === blockVersionData.blockId) {
        const blockVersion = await sequelize.models.BlockVersion.create(blockVersionData);
        newInputs["scratchpadVersionId"] = blockVersion.id
      }
    }
    const newWorkspaceVersion = await this.createWorkspaceVersion(newInputs)
  }
  return Workspace;
};

