import * as Sequelize from "Sequelize";

export const InstructionTypes = [
  "root",
  "honestOracle",
  "maliciousOracle",
  "returningRoot",
  "returningHonestOracle",
  "returningMaliciousOracle",
  "lazyPointerUnlock",
];

const InstructionsModel = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
) => {
  const Instructions = sequelize.define(
    "Instructions",
    {
      type: {
        type: DataTypes.ENUM(InstructionTypes),
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
  );

  Instructions.associate = function(models: any) {
    Instructions.Experiment = Instructions.belongsTo(models.Experiment, {
      as: "experiment",
      foreignKey: "experimentId",
    });
  };

  return Instructions;
};

export default InstructionsModel;
