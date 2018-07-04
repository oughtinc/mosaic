"use strict";
import Sequelize from "sequelize";
import { eventRelationshipColumns, eventHooks, addEventAssociations } from "../eventIntegration";

const PointerImportModel = (sequelize, DataTypes) => {
  const PointerImport = sequelize.define("PointerImport", {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
    isLocked: {
      type: DataTypes.BOOLEAN,
    },
  },                                     {
      hooks: {
        beforeValidate: eventHooks.beforeValidate,
      },
    });

  PointerImport.associate = function (models: any) {
    PointerImport.Pointer = PointerImport.belongsTo(models.Pointer, { as: "pointer", foreignKey: "pointerId" });
    PointerImport.Workspace = PointerImport.belongsTo(models.Workspace, { as: "workspace", foreignKey: "workspaceId" });
    addEventAssociations(PointerImport, models);
  };

  return PointerImport;
};

export default PointerImportModel;