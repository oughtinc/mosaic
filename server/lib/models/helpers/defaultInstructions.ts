export const defaultRootInstructions = `**Instructions for root level workspace**

1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the left
2. Click "Submit"
3. Click "Done!" under the response field`;

export const defaultHonestOracleInstructions = `**Instructions for honest oracle**

1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Done!" under the response field`;

export const defaultMaliciousOracleInstructions = `**Instructions for malicious oracle**

1. Decide whether to challenge the honest oracle on this question and answer
2. If you decide to challenge:
   - Fill in an incorrect/unhelpful but plausible alternative answer below
   - Click "Submit" on the right
   - Click "Done!" under the response field
3. If you decide not to challenge:
   - Click "Done!" under the response field`;

export const defaultReturningRootInstructions = `**Instructions for returning root level workspace**
&nbsp;
1. Just click "Done!" under the response field`;

export const defaultReturningHonestOracleInstructions = `**Instructions for returning honest oracle**
&nbsp;
1. Just click "Done!" under the response field`;

export const defaultReturningMaliciousOracleInstructions = `**Instructions for returning malicious oracle**

1. Check to see if the normal user has asked for clarification
2. If the normal user has asked for clarification:
   - Clarify the issue by either editing the subquestion or by submitting a new subquestion
   - Click "Done!" under the response field
3. If the normal user has *not* asked for clarification:
   - Just click "Done!" under the response field`;
