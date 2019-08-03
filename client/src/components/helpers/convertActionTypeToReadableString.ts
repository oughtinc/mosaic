export function convertActionTypeToReadableString(actionType: string) {
  /**
   * If matches a condition, returns a string formatted for display
   * Otherwise returns the actionType string
   */

  if (actionType === "INITIALIZE") {
    return "Initialize";
  }

  if (actionType === "DONE") {
    return "Done";
  }

  if (actionType === "WAIT_FOR_ANSWER") {
    return "Wait for answer";
  }

  if (actionType === "SKIP_WORKSPACE") {
    return "Skip workspace";
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

  if (actionType === "CONCEDE_TO_MALICIOUS") {
    return "Concede to malicious";
  }

  if (actionType === "PLAY_OUT_SUBTREE") {
    return "Play out subtree";
  }

  return actionType;
}
