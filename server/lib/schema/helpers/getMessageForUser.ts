export async function getMessageForUser({
  isRequestingLazyUnlock,
  instructions,
  isWorkspaceRootLevel,
  isThisFirstTimeWorkspaceHasBeenWorkedOn,
  typeOfUser
}) {

  if (isRequestingLazyUnlock) {
    return instructions.lazyPointerUnlock;
  }

  if (typeOfUser === "TYPICAL") {
    return null;
  }

  if (!isThisFirstTimeWorkspaceHasBeenWorkedOn) {
    if (isWorkspaceRootLevel) {
      return instructions.returningRoot;
    }

    if (typeOfUser === "HONEST") {
      return instructions.returningHonestOracle;
    }

    if (typeOfUser === "MALICIOUS") {
      return instructions.returningMaliciousOracle;
    }
  }

  if (isWorkspaceRootLevel) {
    return instructions.root;
  }

  if (typeOfUser === "HONEST") {
    return instructions.honestOracle;
  }

  if (typeOfUser === "MALICIOUS") {
    return instructions.maliciousOracle;
  }

  return null;
}
