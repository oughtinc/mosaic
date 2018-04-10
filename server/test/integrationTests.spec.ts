import { schema } from '../lib/schema/index';
import { graphql } from 'graphql';
import * as chai from "chai";
const { expect } = chai;
import { print } from "graphql";
import { truncate } from "./testHelpers/sequelizeHelpers";
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
    beforeEach(() => {
        truncate();
    })

    it('creates a root workspace', async () => {
        const rootWorkspace = await createRootWorkspace();
        const workspaceInfo = rootWorkspace.data.createWorkspace;
        console.log(JSON.stringify(workspaceInfo.blocks));
        expect(workspaceInfo.totalBudget === 1000);

        // this is kind of a lame test,
        // but I didn't really want to add more specificity that would make this more brittle
        expect(workspaceInfo.blocks).to.not.be.empty;
    })

})