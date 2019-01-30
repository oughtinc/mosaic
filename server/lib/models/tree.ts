import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations
} from "../eventIntegration";

const TreeModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Tree = sequelize.define("ExportWorkspaceLockRelation", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    ...eventRelationshipColumns(DataTypes),
    isLocked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  Tree.associate = function(models: any) {
    Tree.RootWorkspace = Tree.belongsTo(models.Workspace, {
      foreignKey: "rootWorkspaceId"
    });
    addEventAssociations(Tree, models);
  };

  return Tree;
};

export default TreeModel;
