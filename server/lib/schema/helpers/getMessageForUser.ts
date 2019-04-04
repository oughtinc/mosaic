export function getMessageForUser({
  experiment,
  isWorkspaceRootLevel,
  isThisFirstTimeWorkspaceHasBeenWorkedOn,
  typeOfUser
}) {
  if (typeOfUser === "TYPICAL") {
    return null;
  }

  if (!isThisFirstTimeWorkspaceHasBeenWorkedOn) {
    if (isWorkspaceRootLevel) {
      return experiment.returning_root_instructions;
    }

    if (typeOfUser === "HONEST") {
      return experiment.returning_honest_oracle_instructions;
    }

    if (typeOfUser === "MALICIOUS") {
      return experiment.returning_malicious_oracle_instructions;
    }
  }

  if (isWorkspaceRootLevel) {
    return experiment.root_instructions;
  }

  if (typeOfUser === "HONEST") {
    return experiment.honest_oracle_instructions;
  }

  if (typeOfUser === "MALICIOUS") {
    return experiment.malicious_oracle_instructions;
  }

  return null;
}
