import * as chai from "chai";
const { expect } = chai;
import { truncateDb } from "../../testHelpers/sequelizeHelpers";
import { createRootWorkspace } from "../../testHelpers/graphQLCalls";
import { rootWorkspaceQuestion } from "../../testHelpers/slateHelpers";

describe('graphQL schema', () => {
    describe('createWorkspace', () => {
        beforeEach(() => truncateDb());
    
        it('should create a workspace', async () => {
            const totalBudget = 1000;
            const question = rootWorkspaceQuestion('Mock workspace name');
            const rootWorkspace = await createRootWorkspace(totalBudget, question);
            const workspaceInfo = rootWorkspace.data && rootWorkspace.data.createWorkspace;
        });
    });
})