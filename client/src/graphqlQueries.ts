import gql from "graphql-tag";

export const CREATE_ROOT_WORKSPACE = gql`
  mutation createWorkspace($question: JSON, $totalBudget: Int) {
    createWorkspace(question: $question, totalBudget: $totalBudget) {
      id
      parentId
      creatorId
      isPublic
      childWorkspaceOrder
      totalBudget
      allocatedBudget
      blocks {
        id
        value
        type
      }
    }
  }
`;

export const UPDATE_BLOCKS = gql`
  mutation updateBlocks($blocks: [blockInput]) {
    updateBlocks(blocks: $blocks) {
      id
      value
      updatedAtEventId
    }
  }
`;

export const UPDATE_ALLOCATED_BUDGET = gql`
  mutation updateAllocatedBudget($workspaceId: String, $changeToBudget: Int) {
    updateAllocatedBudget(workspaceId: $workspaceId, changeToBudget: $changeToBudget) {
      id
    }
  }
`;

export const WORKSPACES_QUERY = gql`
  query RootWorkspacesQuery {
    workspaces(where: { parentId: null, hasBeenDeletedByAncestor: false }) {
      id
      parentId
      creatorId
      isPublic
      childWorkspaceOrder
      totalBudget
      createdAt
      allocatedBudget
      blocks {
        id
        value
        type
      }
      connectedPointers
      isEligibleForAssignment
    }
  }
`;

// The only current difference between ROOT_WORKSPACE_SUBTREE_QUERY and
// CHILD_WORKSPACE_SUBTREE_QUERY is that the former asks for
// connectedPointersOfSubtree, but the latter doesn't.

export const ROOT_WORKSPACE_SUBTREE_QUERY = gql`
  query rootWorkspaceSubtree($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      isPublic
      isStale
      isEligibleForOracle
      creatorId
      childWorkspaceOrder
      connectedPointersOfSubtree
      totalBudget
      allocatedBudget
      budgetUsedWorkingOnThisWorkspace
      blocks {
        id
        value
        type
      }
    }
  }
`;

export const CHILD_WORKSPACE_SUBTREE_QUERY = gql`
  query childWorkspaceSubtree($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      isPublic
      isStale
      isEligibleForOracle
      creatorId
      childWorkspaceOrder
      totalBudget
      allocatedBudget
      budgetUsedWorkingOnThisWorkspace
      blocks {
        id
        value
        type
      }
    }
  }
`;

export const UPDATE_WORKSPACE_IS_PUBLIC = gql`
  mutation updateWorkspaceIsPublic($isPublic: Boolean, $workspaceId: String) {
    updateWorkspaceIsPublic(isPublic: $isPublic, workspaceId: $workspaceId) {
      id
    }
  }
`;

export const UPDATE_WORKSPACE_IS_ELIGIBLE = gql`
  mutation updateWorkspaceIsEligible($isEligible: Boolean, $workspaceId: String) {
    updateWorkspaceIsEligible(isEligible: $isEligible, workspaceId: $workspaceId) {
      id
    }
  }
`;
