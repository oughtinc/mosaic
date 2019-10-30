// code doesn't actually run

import {
    workspace,
    Role,
    participant,
    getAssignmentScorer,
} from "./assignmentScoringCoreFunctions";

const getWorkspacesToConsider = (workspaces: workspace[]): workspace[] => {
    return workspaces
        .filter(workspace => workspaceIsInExperiment(workspace))
        .filter(workspace => workspace.needsWork)
        // if it's an HE workspace and the participant is not already allocated to the tree,
        // we'll consider allocating them to the tree and assigning them to the workspace
        .filter(workspace => workspace.role !== Role.Malicious || participantAllocatedToMaliciousWorkspace(workspace))
        .filter(workspace => !participantAssignedToADifferentRoleOnThisTree(workspace))
}

const getAssignment = (participant: participant): workspace => {
    const workspacesToConsider = getWorkspacesToConsider(allWorkspacesInDB);

    const assignmentScorer = getAssignmentScorer(
        treePriorityDecayRate = 0.9,
        honestContaminationSeverity = 0.3,
        treeCompletionWeight = 10,
        contaminationAvoidanceWeight = 3,
        reuseWeight = 2,
        allocationAvoidanceWeight = 5
    );

    return workspacesToConsider.reduce((bestWorkspaceSoFar, currentWorkspace) => {
        const bestScoreSoFar = assignmentScorer(bestWorkspaceSoFar, participant, treePriorityForMock, nodeDistanceForMock, isReuseForMock, isAllocatedForMock);
        const currentScore = assignmentScorer(currentWorkspace, participant, treePriorityForMock, nodeDistanceForMock, isReuseForMock, isAllocatedForMock);
        return currentScore > bestScoreSoFar ? currentWorkspace : bestWorkspaceSoFar;
    });
};