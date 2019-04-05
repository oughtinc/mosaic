'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("Instructions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      type: {
        type: Sequelize.ENUM([
          "root",
          "honestOracle",
          "maliciousOracle",
          "returningRoot",
          "returningHonestOracle",
          "returningMaliciousOracle"
        ]),
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      experimentId: {
        type: Sequelize.UUID,
        references: {
          model: "Experiments",
          key: "id",
        }
      },
    });

    const existingInstructions = await queryInterface.sequelize.query(
      `SELECT "id","root_instructions","honest_oracle_instructions","malicious_oracle_instructions","returning_root_instructions","returning_honest_oracle_instructions","returning_malicious_oracle_instructions" FROM "Experiments"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await Promise.all(existingInstructions.map((experiment) => queryInterface.bulkInsert("Instructions", [
      { experimentId: experiment.id, type: "root", value: experiment.root_instructions },
      { experimentId: experiment.id, type: "honestOracle", value: experiment.honest_oracle_instructions },
      { experimentId: experiment.id, type: "maliciousOracle", value: experiment.malicious_oracle_instructions },
      { experimentId: experiment.id, type: "returningRoot", value: experiment.returning_root_instructions },
      { experimentId: experiment.id, type: "returningHonestOracle", value: experiment.returning_honest_oracle_instructions },
      { experimentId: experiment.id, type: "returningMaliciousOracle", value: experiment.returning_malicious_oracle_instructions },
    ])));

    await queryInterface.removeColumn("Experiments", "root_instructions");
    await queryInterface.removeColumn("Experiments", "honest_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "malicious_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "returning_root_instructions");
    await queryInterface.removeColumn("Experiments", "returning_honest_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "returning_malicious_oracle_instructions");
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn("Experiments", "root_instructions", {
      type: Sequelize.TEXT,
      defaultValue: (
        `**Instructions for root level workspace**\n
&nbsp;\n
1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the left\n
2. Click "Submit"\n
3. Click "Done!" under the response field`
      ),
      allowNull: false,
    });

    await queryInterface.addColumn("Experiments", "honest_oracle_instructions", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: (
        `**Instructions for honest oracle**\n
&nbsp;\n
1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Done!" under the response field`
      ),
    });

    await queryInterface.addColumn("Experiments", "malicious_oracle_instructions", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: (
        `**Instructions for malicious oracle**\n
&nbsp;\n
1. Decide whether to challenge the honest oracle on this question and answer\n
2. If you decide to challenge:\n
   - Fill in an incorrect/unhelpful but plausible alternative answer below\n
   - Click "Submit" on the right\n
   - Click "Done!" under the response field\n
3. If you decide not to challenge:\n
   - Click "Done!" under the response field`
      ),
    });

    await queryInterface.addColumn("Experiments", "returning_root_instructions", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: (
        `**Instructions for returning root level workspace**\n
&nbsp;\n
1. Just click "Done!" under the response field`
      ),
    });

    await queryInterface.addColumn("Experiments", "returning_honest_oracle_instructions", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: (
        `**Instructions for returning honest oracle**\n
&nbsp;\n
1. Just click "Done!" under the response field`
      ),
    });

    await queryInterface.addColumn("Experiments", "returning_malicious_oracle_instructions", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: (
        `**Instructions for returning malicious oracle**\n
&nbsp;\n
1. Check to see if the normal user has asked for clarification\n
2. If the normal user has asked for clarification:\n
   - Clarify the issue by either editing the subquestion or by submitting a new subquestion\n
   - Click "Done!" under the response field\n
3. If the normal user has *not* asked for clarification:\n
   - Just click "Done!" under the response field\n`
      ),
    });

    const existingInstructions = await queryInterface.sequelize.query(
      `SELECT "ExperimentId","type","value" FROM "Instructions"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await Promise.all(existingInstructions.map(async (instruction) => {
      let fieldName;

      if (instruction.type === "root") {
        fieldName = "root_instructions";
      } else if (instruction.type === "honestOracle") {
        fieldName = "honest_oracle_instructions";
      } else if (instruction.type === "maliciousOracle") {
        fieldName = "malicious_oracle_instructions";
      } else if (instruction.type === "returningRoot") {
        fieldName = "returning_root_instructions";
      } else if (instruction.type === "returningHonestOracle") {
        fieldName = "returning_honest_oracle_instructions";
      } else if (instruction.type === "returningMaliciousOracle") {
        fieldName = "returning_malicious_oracle_instructions";
      } else {
        return;
      }

      await queryInterface.sequelize.query(
        `UPDATE Experiments SET ${fieldName} = :value WHERE id = :experimentId`,
        {
          replacements: { value: instruction.value, experimentId: instruction.experimentId },
          type: Sequelize.QueryTypes.UPDATE,
        }
      )
    }));

    await queryInterface.dropTable("Instructions");
  }
};
