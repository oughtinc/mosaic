import { graphql } from 'graphql';
import { print } from "graphql";
import { schema } from '../../lib/schema/index';
import { CREATE_ROOT_WORKSPACE } from "../../../client/src/graphqlQueries"

const runGraphQLQuery = (queryAST: any, queryArgs: any) => {
    return graphql(schema, print(queryAST), null, null, queryArgs);
}

export const createRootWorkspace = () => {
    const totalBudget = "1000";
    const createRootWorkspaceQuestion = "{\"object\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"object\":\"text\",\"leaves\":[{\"object\":\"leaf\",\"text\":\"Fake root workspace\",\"marks\":[]}]}]}";
    const createRootWorkspaceArgs = { question: createRootWorkspaceQuestion, totalBudget };
    return runGraphQLQuery(CREATE_ROOT_WORKSPACE, createRootWorkspaceArgs);
}
