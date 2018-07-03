import { graphql, ExecutionResult } from "graphql";
import { print } from "graphql";
import { schema } from "../../lib/schema/index";
import { CREATE_ROOT_WORKSPACE } from "../../../client/src/graphqlQueries";

const runGraphQLQuery = (queryAST: any, queryArgs: any): Promise<ExecutionResult> => graphql(schema, print(queryAST), null, null, queryArgs);

export const createRootWorkspace = (totalBudget: number, question: string, creatorId: string): Promise<ExecutionResult> => {
    const createRootWorkspaceArgs = { question, totalBudget, creatorId };
    return runGraphQLQuery(CREATE_ROOT_WORKSPACE, createRootWorkspaceArgs);
};
