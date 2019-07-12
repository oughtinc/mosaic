export function convertBlockTypeToReadableString(blockType: string) {
  if (blockType === "QUESTION") {
    return "Question";
  }

  if (blockType === "SCRATCHPAD") {
    return "Scratchpad";
  }

  if (blockType === "ANSWER_DRAFT") {
    return "Answer Draft";
  }

  if (blockType === "SUBQUESTION_DRAFT") {
    return "Subquestion Draft";
  }

  if (blockType === "ORACLE_ANSWER_CANDIDATE") {
    return "Answer Candidate";
  }

  return blockType;
}
