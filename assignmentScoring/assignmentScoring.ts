enum Role {
    Judge = 0,
    Honest,
    Malicious
};

type workspace = {
    role: Role;
};

type participant = {};

type tree = {
    // priority is unique and highest priority is 1 -- so there's a tree with priority 1, then with priority 2, etc.
    priority: number;
};

const mockGetTreeThatContainsWorkspace = (workspace: workspace, priorityForMock: number): tree => {
    const treeThatContainsWorkspace = { priority: 1 };
    return treeThatContainsWorkspace;
};

const mockGetDistanceToNearestPreviouslyAssignedNodeInTree = (workspace: workspace, distanceForMock: number): number => {
    // distance of NearestPreviouslyAssignedNodeInTree is based only on that role,
    // i.e.if I’m a judge it’s the distance up or down the tree to the nearest judge workspace I worked on.
    // So if I asked the subquestion I’m currently working on, it’s 1.
    const distanceToNearestPreviouslyAssignedNodeInTree = 1;
    return distanceToNearestPreviouslyAssignedNodeInTree;
}

const mockWasParticipantPreviouslyAssignedToWorkspace = (workspace: workspace, participant: participant, wasAssignedForMock: boolean): boolean => {
    return wasAssignedForMock;
}

const getTreeCompletionSubscore = (workspace: workspace, decayRate: number, treePriorityForMock: number): number => {
    const tree = mockGetTreeThatContainsWorkspace(workspace, treePriorityForMock);
    return decayRate ** (tree.priority - 1);
};

const getContaminationAvoidanceSubscore = (
    workspace: workspace,
    honestContaminationSeverity: number,
    nodeDistanceForMock: number
): number => {
    if (workspace.role === Role.Malicious) {
        return 1;
    }

    const contaminationSeverity = workspace.role === Role.Judge ? 1 : honestContaminationSeverity;
    const distanceToNearestPreviousAssignment = mockGetDistanceToNearestPreviouslyAssignedNodeInTree(workspace, nodeDistanceForMock);
    return 1 - contaminationSeverity * ((1/2) ** (distanceToNearestPreviousAssignment - 1));
};

const getReuseSubscore = (
    workspace: workspace,
    participant: participant,
    isReuseForMock: boolean
): number => {
    if (!(workspace.role === Role.Judge)) {
        return 0;
    }

    const isReuse = mockWasParticipantPreviouslyAssignedToWorkspace(workspace, participant, isReuseForMock)
    return isReuse ? 1 : 0;
}

const getTotalScoreForPotentialAssigment = (
    workspace: workspace,
    participant: participant,
    treePriorityDecayRate: number,
    honestContaminationSeverity: number,
    treeCompletionWeight: number,
    contaminationAvoidanceWeight: number,
    reuseWeight: number,
    treePriorityForMock: number,
    nodeDistanceForMock: number,
    isReuseForMock: boolean,
) => {
    const treeCompletionSubscore = getTreeCompletionSubscore(workspace, treePriorityDecayRate, treePriorityForMock);
    const contaminationAvoidanceSubscore = getContaminationAvoidanceSubscore(workspace, honestContaminationSeverity, nodeDistanceForMock);
    const reuseSubscore = getReuseSubscore(workspace, participant, isReuseForMock);
    const rawScore = treeCompletionWeight * treeCompletionSubscore + contaminationAvoidanceWeight * contaminationAvoidanceSubscore + reuseWeight * reuseSubscore;
    return rawScore/(treeCompletionWeight + contaminationAvoidanceWeight + reuseWeight);
}

getTotalScoreForPotentialAssigment (
    workspace,
    participant,
    treePriorityDecayRate = 0.9,
    honestContaminationSeverity = 0.3,
    treeCompletionWeight = 10,
    contaminationAvoidanceWeight = 3,
    reuseWeight = 2,
    treePriorityForMock,
    nodeDistanceForMock,
    isReuseForMock
);
