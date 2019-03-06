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
  const Tree = sequelize.define("Tree", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    ...eventRelationshipColumns(DataTypes),
  });

  Tree.associate = function(models: any) {
    Tree.RootWorkspace = Tree.belongsTo(models.Workspace, {
      foreignKey: "rootWorkspaceId"
    });
    Tree.Experiments = Tree.belongsToMany(models.Experiment, {
      through: "ExperimentTreeRelation",
    });
    Tree.Oracles = Tree.belongsToMany(models.User, {
      as: "Oracles",
      through: "UserTreeOracleRelation",
    });
    addEventAssociations(Tree, models);
  };

  return Tree;
};

export default TreeModel;
