import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";
import {
  defaultHonestOracleInstructions,
  defaultMaliciousOracleInstructions,
  defaultReturningHonestOracleInstructions,
  defaultReturningMaliciousOracleInstructions,
  defaultReturningRootInstructions,
  defaultRootInstructions
} from "./helpers/defaultInstructions";

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
    Experiment.Instructions = Experiment.hasMany(models.Instructions, {
      as: "instructions",
      foreignKey: "experimentId",
    });
    addEventAssociations(Experiment, models);

    Experiment.afterCreate(experiment => models.Instructions.bulkCreate([
      { experimentId: experiment.id, type: "root", value: defaultRootInstructions },
      { experimentId: experiment.id, type: "honestOracle", value: defaultHonestOracleInstructions },
      { experimentId: experiment.id, type: "maliciousOracle", value: defaultMaliciousOracleInstructions },
      { experimentId: experiment.id, type: "returningRoot", value: defaultReturningRootInstructions },
      { experimentId: experiment.id, type: "returningHonestOracle", value: defaultReturningHonestOracleInstructions },
      { experimentId: experiment.id, type: "returningMaliciousOracle", value: defaultReturningMaliciousOracleInstructions },
    ]));
  };

  Experiment.prototype.isActive = function() {
    return this.eligibilityRank === 1;
  }

  return Experiment;
};

export default ExperimentModel;
