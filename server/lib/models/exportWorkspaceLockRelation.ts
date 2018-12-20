import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";

const ExportWorkspaceLockRelationModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const ExportWorkspaceLockRelation = sequelize.define(
    "ExportWorkspaceLockRelation",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      ...eventRelationshipColumns(DataTypes),
      isLocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    },
  );

  ExportWorkspaceLockRelation.associate = function(models: any) {
    ExportWorkspaceLockRelation.Workspace = ExportWorkspaceLockRelation.belongsTo(
      models.Workspace, {
        foreignKey: "workspaceId",
      });
    ExportWorkspaceLockRelation.Export = ExportWorkspaceLockRelation.belongsTo(
      models.Pointer, {
        foreignKey: "pointerId",
      });
    addEventAssociations(ExportWorkspaceLockRelation, models);
  };

  return ExportWorkspaceLockRelation;
};

export default ExportWorkspaceLockRelationModel;
