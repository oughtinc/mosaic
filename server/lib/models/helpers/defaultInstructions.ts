export const defaultRootInstructions = `**Instructions for root level workspace**

1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the right
2. Click "Submit"
3. Click "Done!" under the response field`;

export const defaultHonestOracleInstructions = `**Instructions for honest oracle**

1. Fill in a correct/helpful answer in the **Answer Candidate** field on the right
2. Click "Done!"`;

export const defaultMaliciousOracleInstructions = `**Instructions for malicious oracle**

1. Decide whether to challenge the honest oracle on this question and answer
2. If you decide to challenge:
   - Fill in an incorrect/unhelpful but plausible alternative answer in the **Answer Candidate** field on the right
   - Click "Challenge!" under the **Answer Candidate** field
3. If you decide not to challenge:
   - Click "Decline to Challenge!" under the **Answer Candidate** field`;

export const defaultReturningRootInstructions = `**Instructions**

1. Let the experiment administrator know that you see this message
2. Please navigate to the main experiment page and rejoin the experiment`;

export const defaultReturningHonestOracleInstructions = `**Instructions**

1. Let the experiment administrator know that you see this message
2. Please navigate to the main experiment page and rejoin the experiment`;

export const defaultReturningMaliciousOracleInstructions = `**Instructions**

1. Let the experiment administrator know that you see this message
2. Please navigate to the main experiment page and rejoin the experiment`;

export const defaultLazyPointerUnlockInstructions = `**Instructions for unlocking lazy pointer**

1. Use the response field to describe the contents of the lazy pointer
2. As an oracle, you can open the lazy pointer by clicking on it
3. If you need more information than what you included in the lazy pointer, you can click the "Entire Tree »" button above to view the entire tree so far
4. When you've finished, click "Done!" under the response field`;
