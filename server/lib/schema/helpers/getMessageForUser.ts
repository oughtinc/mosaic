export function getMessageForUser({isRequestingLazyUnlock, isWorkspaceRootLevel, isThisFirstTimeWorkspaceHasBeenWorkedOn, typeOfUser}) {
  if(isRequestingLazyUnlock) {
    return (
`**Instructions for unlocking lazy pointer**\n
&nbsp;\n
1. Use the response field to describe the contents of the lazy pointer\n
2. As an oracle, you can open the lazy pointer by clicking on it\n
3. If you need more information than what you included in the lazy pointer, you can click the "Entire Tree »" button above to view the entire tree so far\n
4. When you've finished, click "Done!" under the response field`
    );
  }

  if (typeOfUser === "TYPICAL") {
    return null;
  }

  if (!isThisFirstTimeWorkspaceHasBeenWorkedOn) {
    if (isWorkspaceRootLevel) {
      return (
`**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`
      );
    }

    if (typeOfUser === "HONEST") {
      return (
`**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`
      );
    }

    if (typeOfUser === "MALICIOUS") {
      return (
`**Instructions**\n
&nbsp;\n
1. Let the experiment administrator know that you see this message\n
2. Please navigate to the main experiment page and rejoin the experiment\n`
      );
    }
  }

  if (isWorkspaceRootLevel) {
    return (
`**Instructions for root level workspace**\n
&nbsp;\n
1. Formulate a question about the text referenced in the scratchpad, and write your question in the **New Question** field on the left\n
2. Click "Submit"\n
3. Click "Done!" under the response field`
    );
  }

  if (typeOfUser === "HONEST") {
    return (
`**Instructions for honest oracle**\n
&nbsp;\n
1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Done!" under the response field`
    );
  }

  if (typeOfUser === "MALICIOUS") {
    return (
`**Instructions for malicious oracle**\n
&nbsp;\n
1. Decide whether to challenge the honest oracle on this question and answer\n
2. If you decide to challenge:\n
   - Fill in an incorrect/unhelpful but plausible alternative answer below\n
   - Click "Submit" on the right\n
   - Click "Challenge!" under the response field\n
3. If you decide not to challenge:\n
   - Click "Decline to Challenge!" under the response field`
    );
  }

  return null;
}