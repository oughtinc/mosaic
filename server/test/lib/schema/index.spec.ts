import * as chai from "chai";
const { expect } = chai;
import { truncate } from "../../testHelpers/sequelizeHelpers";
import { createRootWorkspace } from "../../testHelpers/graphQLCalls";

describe('graphQL schema', () => {
    describe('createWorkspace for a root workspace', () => {
        beforeEach(() => truncate());
    
        it('should create a root workspace', async () => {
            const totalBudget = 1000;
            const question = "{\"object\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"object\":\"text\",\"leaves\":[{\"object\":\"leaf\",\"text\":\"Fake root workspace\",\"marks\":[]}]}]}";
            const rootWorkspace = await createRootWorkspace(totalBudget, question);
            const workspaceInfo = rootWorkspace.data && rootWorkspace.data.createWorkspace;
            expect(workspaceInfo.totalBudget === 1000);
    
            // this is kind of a lame expect,
            // but I didn't really want to add more specificity that would make this more brittle
            expect(workspaceInfo.blocks).to.not.be.empty;
        });
    });
})