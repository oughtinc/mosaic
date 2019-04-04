'use strict';

module.exports = {
  up: async function(queryInterface, Sequelize) {
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
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experiments", "root_instructions");
    await queryInterface.removeColumn("Experiments", "honest_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "malicious_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "returning_root_instructions");
    await queryInterface.removeColumn("Experiments", "returning_honest_oracle_instructions");
    await queryInterface.removeColumn("Experiments", "returning_malicious_oracle_instructions");
  }
};
