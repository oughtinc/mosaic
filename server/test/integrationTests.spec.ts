import { schema } from '../lib/schema/index';
import { graphql } from 'graphql';
import * as chai from "chai";
const { expect } = chai;
import { print } from "graphql";
import { CREATE_ROOT_WORKSPACE } from "../../client/src/graphqlQueries"

const totalBudget = "1000"

const runGraphQLQuery = (queryAST: any, queryArgs: any) => {
    return graphql(schema, print(queryAST), null, null, queryArgs)
}

const createRootWorkspace = () => {
    const createRootWorkspaceQuestion = "{\"object\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"object\":\"text\",\"leaves\":[{\"object\":\"leaf\",\"text\":\"Fake root workspace\",\"marks\":[]}]}]}"
    const createRootWorkspaceArgs = { question: createRootWorkspaceQuestion, totalBudget }
    return runGraphQLQuery(CREATE_ROOT_WORKSPACE, createRootWorkspaceArgs);
}

describe('createWorkspace for a root workspace', () => {
    it('creates a root workspace', () => {
        return createRootWorkspace();
    })
})