import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  eventHooks,
  addEventAssociations,
} from "../eventIntegration";

const UserTreeOracleRelationModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const UserTreeOracleRelation = sequelize.define(
    "UserTreeOracleRelation",
    {
      isMalicious: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ...eventRelationshipColumns(DataTypes),
    },
    {
      freezeTableName: true,
    }
  );

  UserTreeOracleRelation.associate = function(models: any) {
    UserTreeOracleRelation.User = UserTreeOracleRelation.belongsTo(
      models.User, {
        foreignKey: "UserId",
      });
      UserTreeOracleRelation.Tree = UserTreeOracleRelation.belongsTo(
      models.Tree, {
        foreignKey: "TreeId",
      });
    addEventAssociations(UserTreeOracleRelation, models);
  };

  return UserTreeOracleRelation;
};

export default UserTreeOracleRelationModel;
