import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations
} from "../eventIntegration";

const AssignmentModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Assignment = sequelize.define("Assignment", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    userId: {
      type: Sequelize.STRING,
    },
    startAtTimestamp: {
      type: Sequelize.BIGINT,
    },
    endAtTimestamp: {
      type: Sequelize.BIGINT,
    },
    isOracle: {
      type: Sequelize.BOOLEAN
    },
    isTimed: {
      type: Sequelize.BOOLEAN
    },
    ...eventRelationshipColumns(DataTypes),
  });

  Assignment.associate = function(models: any) {
    Assignment.Workspace = Assignment.belongsTo(models.Workspace, {
      foreignKey: "workspaceId"
    });
    Assignment.Experiments = Assignment.belongsTo(models.Experiment, {
      foreignKey: "experimentId",
    });
    addEventAssociations(Assignment, models);
  };

  return Assignment;
};

export default AssignmentModel;
