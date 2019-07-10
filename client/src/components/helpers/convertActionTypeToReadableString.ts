export function convertActionTypeToReadableString(actionType: string) {
  if (actionType === "INITIALIZE") {
    return "Initialize";
  }

  if (actionType === "DONE") {
    return "Done";
  }

  if (actionType === "WAIT_FOR_ANSWER") {
    return "Wait for Answer";
  }

  if (actionType === "NEEDS_MORE_WORK") {
    return "Needs more work";
  }

  if (actionType === "SUBMIT_ANSWER_CANDIDATE") {
    return "Submit answer candidate";
  }

  if (actionType === "DECLINE_TO_CHALLENGE") {
    return "Decline to challenge";
  }

  if (actionType === "SELECT_A1") {
    return "Select A1";
  }

  if (actionType === "SELECT_A2") {
    return "Select A2";
  }

  if (actionType === "UNLOAD") {
    return "Unload";
  }

  return actionType;
}