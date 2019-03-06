import * as Sequelize from "sequelize";
import {
  eventRelationshipColumns,
  addEventAssociations,
} from "../eventIntegration";

const UserModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      familyName: Sequelize.STRING,
      givenName: Sequelize.STRING,
      gender: Sequelize.STRING,
      pictureURL: Sequelize.STRING,
      ...eventRelationshipColumns(DataTypes),
    },
  );

  User.associate = function(models: any) {
    User.OracleTrees = User.belongsToMany(models.Tree, {through: 'UserTreeOracleRelation'});
    addEventAssociations(User, models);
  };

  return User;
};

export default UserModel;
