'use strict';

const defaultRootInstructions = `**Instructions for root level workspace**\n
&nbsp;\n
1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the left\n
2. Click "Submit"\n
3. Click "Done!" under the response field`;

const defaultHonestOracleInstructions = `**Instructions for honest oracle**\n
&nbsp;\n
1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Done!" under the response field`;

const defaultMaliciousOracleInstructions = `**Instructions for malicious oracle**\n
&nbsp;\n
1. Decide whether to challenge the honest oracle on this question and answer\n
2. If you decide to challenge:\n
   - Fill in an incorrect/unhelpful but plausible alternative answer below\n
   - Click "Submit" on the right\n
   - Click "Challenge!" under the response field\n
3. If you decide not to challenge:\n
   - Click "Done!" under the response field`;

const defaultReturningRootInstructions = `**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`;

const defaultReturningHonestOracleInstructions = `**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`;

const defaultReturningMaliciousOracleInstructions = `**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`;

const defaultLazyPointerUnlockInstructions = `**Instructions for unlocking lazy pointer**\n
&nbsp;\n
1. Use the response field to describe the contents of the lazy pointer\n
2. As an oracle, you can open the lazy pointer by clicking on it\n
3. If you need more information than what you included in the lazy pointer, you can click the "Entire Tree »" button above to view the entire tree so far\n
4. When you've finished, click "Done!" under the response field`;

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
          "returningMaliciousOracle",
          "lazyPointerUnlock",
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

    const existingExperiments = await queryInterface.sequelize.query(
      `SELECT "id" FROM "Experiments"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await Promise.all(existingExperiments.map(({ id }) => queryInterface.bulkInsert("Instructions", [
      { experimentId: id, type: "root", value: defaultRootInstructions },
      { experimentId: id, type: "honestOracle", value: defaultHonestOracleInstructions },
      { experimentId: id, type: "maliciousOracle", value: defaultMaliciousOracleInstructions },
      { experimentId: id, type: "returningRoot", value: defaultReturningRootInstructions },
      { experimentId: id, type: "returningHonestOracle", value: defaultReturningHonestOracleInstructions },
      { experimentId: id, type: "returningMaliciousOracle", value: defaultReturningMaliciousOracleInstructions },
      { experimentId: id, type: "lazyPointerUnlock", value: defaultLazyPointerUnlockInstructions },
    ])));

  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.dropTable("Instructions");
  }
};
