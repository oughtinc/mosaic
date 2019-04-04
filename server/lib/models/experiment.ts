import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";

const ExperimentModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Experiment = sequelize.define(
    "Experiment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      name: Sequelize.STRING,
      eligibilityRank: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      },
      description: Sequelize.JSON,
      root_instructions: {
        type: Sequelize.TEXT,
        defaultValue: (
`**Instructions for root level workspace**\n
&nbsp;\n
1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the left\n
2. Click "Submit"\n
3. Click "Done!" under the response field`
        ),
        allowNull: false,
      },
      honest_oracle_instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: (
          `**Instructions for honest oracle**\n
&nbsp;\n
1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Done!" under the response field`
        ),
      },
      malicious_oracle_instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: (
          `**Instructions for malicious oracle**\n
&nbsp;\n
1. Decide whether to challenge the honest oracle on this question and answer\n
2. If you decide to challenge:\n
   - Fill in an incorrect/unhelpful but plausible alternative answer below\n
   - Click "Submit" on the right\n
   - Click "Done!" under the response field\n
3. If you decide not to challenge:\n
   - Click "Done!" under the response field`
        ),
      },
      returning_root_instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: (
          `**Instructions for returning root level workspace**\n
&nbsp;\n
1. Just click "Done!" under the response field`
        ),
      },
      returning_honest_oracle_instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: (
          `**Instructions for returning honest oracle**\n
&nbsp;\n
1. Just click "Done!" under the response field`
        ),
      },
      returning_malicious_oracle_instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: (
          `**Instructions for returning malicious oracle**\n
&nbsp;\n
1. Check to see if the normal user has asked for clarification\n
2. If the normal user has asked for clarification:\n
   - Clarify the issue by either editing the subquestion or by submitting a new subquestion\n
   - Click "Done!" under the response field\n
3. If the normal user has *not* asked for clarification:\n
   - Just click "Done!" under the response field\n`
        ),
      },
      metadata: Sequelize.JSON,
      areNewWorkspacesOracleOnlyByDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ...eventRelationshipColumns(DataTypes),
    },
  );

  Experiment.associate = function(models: any) {
    Experiment.Trees = Experiment.belongsToMany(models.Tree, {through: 'ExperimentTreeRelation'});
    Experiment.Fallbacks = Experiment.belongsToMany(models.Experiment, {
      as: "Fallbacks",
      through: "FallbackRelation",
      foreignKey: "primaryExperimentId",
      otherKey: "fallbackExperimentId",
    })
    addEventAssociations(Experiment, models);
  };

  Experiment.prototype.isActive = function() {
    return this.eligibilityRank === 1;
  }

  return Experiment;
};

export default ExperimentModel;
