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
      metadata: Sequelize.JSON,
      areNewWorkspacesOracleOnlyByDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
