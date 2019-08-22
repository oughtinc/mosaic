// the code in this file is designed to actually be able to compile and run
// so that we can use it to write tests and make charts to show how the scores would work in practice

export enum Role {
    Judge = 0,
    Honest,
    Malicious
};

export type workspace = {
    role: Role;
    needsWork: boolean;
};

export type participant = {};

export type tree = {
    // priority is unique and highest priority is 1 -- so there's a tree with priority 1, then with priority 2, etc.
    priority: number;
};

export const mockGetTreeThatContainsWorkspace = (workspace: workspace, priorityForMock: number): tree => {
    const treeThatContainsWorkspace = { priority: 1 };
    return treeThatContainsWorkspace;
};

export const mockGetDistanceToNearestPreviouslyAssignedNodeInTree = (workspace: workspace, distanceForMock: number): number => {
    // distance of NearestPreviouslyAssignedNodeInTree is based only on that role,
    // i.e.if I’m a judge it’s the distance up or down the tree to the nearest judge workspace I worked on.
    // So if I asked the subquestion I’m currently working on, it’s 1.
    const distanceToNearestPreviouslyAssignedNodeInTree = 1;
    return distanceToNearestPreviouslyAssignedNodeInTree;
}

export const mockWasParticipantPreviouslyAssignedToWorkspace = (workspace: workspace, participant: participant, wasAssignedForMock: boolean): boolean => {
    return wasAssignedForMock;
}

export const mockIsParticipantAllocatedToTree = (workspace: workspace, participant: participant, wasAllocatedForMock: boolean): boolean => {
    return wasAllocatedForMock;
}

export const getTreeCompletionSubscore = (workspace: workspace, decayRate: number, treePriorityForMock: number): number => {
    const tree = mockGetTreeThatContainsWorkspace(workspace, treePriorityForMock);
    return decayRate ** (tree.priority - 1);
};

export const getContaminationAvoidanceSubscore = (
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

export const getReuseSubscore = (
    workspace: workspace,
    participant: participant,
    isReuseForMock: boolean
): number => {
    if (!(workspace.role === Role.Judge)) {
        return 0;
    }

    const isReuse = mockWasParticipantPreviouslyAssignedToWorkspace(workspace, participant, isReuseForMock)
    return isReuse ? 1 : 0;
};

export const getAvoidHonestAllocationSubscore = (workspace: workspace, participant: participant, allocatedForMock: boolean): number => {
    if (workspace.role !== Role.Honest) {
        return 1;
    }

    if (mockIsParticipantAllocatedToTree(workspace, participant, allocatedForMock)) {
        return 1;
    }

    return 0;
}

export const getTotalScoreForPotentialAssigment = (
    workspace: workspace,
    participant: participant,
    treePriorityDecayRate: number,
    honestContaminationSeverity: number,
    treeCompletionWeight: number,
    contaminationAvoidanceWeight: number,
    reuseWeight: number,
    allocationAvoidanceWeight: number,
    treePriorityForMock: number,
    nodeDistanceForMock: number,
    isReuseForMock: boolean,
    isAllocatedForMock: boolean
): number => {
    const treeCompletionSubscore = getTreeCompletionSubscore(workspace, treePriorityDecayRate, treePriorityForMock);
    const contaminationAvoidanceSubscore = getContaminationAvoidanceSubscore(workspace, honestContaminationSeverity, nodeDistanceForMock);
    const reuseSubscore = getReuseSubscore(workspace, participant, isReuseForMock);
    const avoidHonestAllocationSubscore = getAvoidHonestAllocationSubscore(workspace, participant, isAllocatedForMock);
    const rawScore = treeCompletionWeight * treeCompletionSubscore +
        contaminationAvoidanceWeight * contaminationAvoidanceSubscore + 
        reuseWeight * reuseSubscore +
        allocationAvoidanceWeight * avoidHonestAllocationSubscore;

    // final score is normalized to be from 0 to 1
    return rawScore/(treeCompletionWeight + contaminationAvoidanceWeight + reuseWeight);
};

export const getAssignmentScorer = (
    treePriorityDecayRate: number,
    honestContaminationSeverity: number,
    treeCompletionWeight: number,
    contaminationAvoidanceWeight: number,
    reuseWeight: number,
    allocationAvoidanceWeight: number
) => {
    return (
        workspace,
        participant,
        treePriorityForMock,
        nodeDistanceForMock,
        isReuseForMock,
        isAllocatedForMock
    ) => getTotalScoreForPotentialAssigment(
        workspace,
        participant,
        treePriorityDecayRate,
        honestContaminationSeverity,
        treeCompletionWeight,
        contaminationAvoidanceWeight,
        reuseWeight,
        allocationAvoidanceWeight,
        treePriorityForMock,
        nodeDistanceForMock,
        isReuseForMock,
        isAllocatedForMock
    );
};
