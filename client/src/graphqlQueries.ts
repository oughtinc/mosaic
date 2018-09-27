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

export const TOGGLE_WORKSPACE_ELIGIBILITY = gql`
  mutation toggleWorkspaceEligibility($workspaceId: String) {
      toggleWorkspaceEligibility(workspaceId: $workspaceId) {
        id
      }
    }
`;

export const TOGGLE_WORKSPACE_FRONT_PAGE_VISIBILITY = gql`
  mutation toggleWorkspaceFrontPageVisibility($workspaceId: String) {
      toggleWorkspaceFrontPageVisibility(workspaceId: $workspaceId) {
        id
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

export const WORKSPACES_QUERY = gql`
  query OriginWorkspaces {
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
      creatorId
      childWorkspaceOrder
      connectedPointersOfSubtree
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
      creatorId
      childWorkspaceOrder
      blocks {
        id
        value
        type
      }
    }
  }
`;
