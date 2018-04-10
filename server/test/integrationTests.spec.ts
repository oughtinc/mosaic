import { schema } from '../lib/schema/index';
import { graphql } from 'graphql';
import * as chai from "chai";
const { expect } = chai;
import gql from "graphql-tag";

export const CREATE_ROOT_WORKSPACE = `
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

const question = "{\"object\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"object\":\"text\",\"leaves\":[{\"object\":\"leaf\",\"text\":\"Fake root workspace\",\"marks\":[]}]}]}"

const totalBudget = "1000"

// const createMockRootWorkspaceQuery = `
//   mutation createWorkspace($question: JSON, $totalBudget: Int){
//     createWorkspace(question:$question, totalBudget:$totalBudget ){
//         id
//         parentId
//         childWorkspaceOrder
//         totalBudget 
//         allocatedBudget 
//         blocks{
//             id
//             value
//             type
//         }
//     }
//   }
// `

const createMockRootWorkspaceQuery = `
    mutation createWorkspace($question: JSON, $totalBudget: Int) {
        createWorkspace(question: $question, totalBudget: $totalBudget ){
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
`

// const createMockRootWorkspaceQuery = `
//     mutation createWorkspace {
//         createWorkspace(question: "${JSON.parse(question)}", totalBudget: 1000 ){
//             id
//             parentId
//             childWorkspaceOrder
//             totalBudget 
//             allocatedBudget 
//             blocks{
//                 id
//                 value
//                 type
//             }
//         }
//     }
// `

const sillyTestQuery = '{ hello }'

describe('createWorkspace for a root workspace', () => {
    
    // it('creates a root workspace', () =>{
    //     return graphql(schema, sillyTestQuery)
    //         .then(console.log)
    // })
    it('creates a root workspace', () => {
        return graphql(schema, CREATE_ROOT_WORKSPACE, null, null, { question, totalBudget })
            .then(console.log)
    })
})