import gql from "graphql-tag";

export const CREATE_ROOT_WORKSPACE = gql`
  mutation createWorkspace($question:JSON, $totalBudget: Int){
    createWorkspace(question:$question, totalBudget:$totalBudget ){
        id
        parentId
        creatorId
        public
        childWorkspaceOrder
        totalBudget 
        allocatedBudget 
        blocks{
            id
            value
            type
        }
    }
  }
`;

export const UPDATE_BLOCKS = gql`
    mutation updateBlocks($blocks:[blockInput]){
        updateBlocks(blocks:$blocks){
            id
            value
            updatedAtEventId
        }
    }
`;

export const WORKSPACES_QUERY = gql`
    query OriginWorkspaces{
        workspaces(where:{parentId:null, hasBeenDeletedByAncestor:false}){
          id
          parentId
          creatorId
          public
          childWorkspaceOrder
          totalBudget 
          createdAt
          allocatedBudget 
          blocks{
              id
              value
              type
          }
        }
    }
 `;

export const WORKSPACE_SUBTREE_QUERY = gql`
    query workspaceSubtree($workspaceId: String!){
        subtreeWorkspaces(workspaceId:$workspaceId){
            id
            childWorkspaceOrder
            connectedPointers
            blocks{
                id
                value
                type
            }
        }
    }
`;
