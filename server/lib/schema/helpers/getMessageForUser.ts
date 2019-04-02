export function getMessageForUser({isWorkspaceRootLevel, isThisFirstTimeWorkspaceHasBeenWorkedOn, typeOfUser}) {
    if (typeOfUser === "TYPICAL") {
        return null;
      }

    if (!isThisFirstTimeWorkspaceHasBeenWorkedOn) {
        if (typeOfUser === "HONEST") {
            return (
`**Instructions for returning honest oracle**\n
&nbsp;\n
1. See how the malicious oracle has responded\n
2. If the malicious oracle is reporting which answer the normal user has selected:\n
   - Include this selected answer in the reponse field, even if it is the malicious answer\n
   - Click "Done & bubble answer up" under the response field\n
3. If the malicious oracle is reporting they don't want to challenge your answer:\n
   - Include your honest answer in the reponse field\n
   - Click "Done & bubble answer up" under the response field`
            );
          }

        if (typeOfUser === "MALICIOUS") {
            return (
`**Instructions for returning malicious oracle**\n
&nbsp;\n
1. See how the normal user has responded\n
2. If the normal user has selected one of the answers:\n
   - Include this selected answer in the reponse field\n
   - Click "Done & bubble answer up" under the response field\n
3. If the normal user has asked for clarification:\n
   - Clarify the issue by either editing the subquestion or by submitting a new subquestion
   - Click "Next workspace" under the response field`
            );
        }
    }

    if (isWorkspaceRootLevel) {
      return (
`**Instructions for root level workspace**\n
&nbsp;\n
1. Insert your question into the question draft on the right\n
2. Click "Submit"\n
3. Click "Next workspace" under the response field`
      );
    }

    if (typeOfUser === "HONEST") {
      return (
`**Instructions for honest oracle**\n
&nbsp;\n
1. Fill in a correct/helpful answer below\n
2. Click "Submit" on the right\n
3. Click "Next workspace" under the response field`
      );
    }

    if (typeOfUser === "MALICIOUS") {
      return (
`**Instructions for malicious oracle**\n
&nbsp;\n
1. Decide whether to challenge the honest oracle on this question and answer\n
2. If you decided to challenge:\n
   - Fill in an incorrect/unhelpful but plausible alternative answer below\n
   - Click "Submit" on the right\n
   - Click "Next workspace" under the response field\n
3. If you decide not to challenge:\n
   - Write "No challenge" or something similar in the response field\n
   - Click "Done & bubble answer up" under the response field`
      );
    }

    return null;
  }