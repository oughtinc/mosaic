import gql from "graphql-tag";

export const CREATE_ROOT_WORKSPACE = gql`
  mutation createWorkspace($question:JSON, $totalBudget: Int){
    createWorkspace(question:$question, totalBudget:$totalBudget ){
        id
        parentId
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
        workspaces(where:{parentId:null}){
          id
          parentId
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