import * as chai from "chai";
const { expect } = chai;
import { truncate } from "./testHelpers/sequelizeHelpers";
import { createRootWorkspace } from "./testHelpers/graphQLCalls";

describe('createWorkspace for a root workspace', () => {
    beforeEach(() => truncate());

    it('should create a root workspace', async () => {
        const rootWorkspace = await createRootWorkspace();
        const workspaceInfo = rootWorkspace.data.createWorkspace;
        expect(workspaceInfo.totalBudget === 1000);

        // this is kind of a lame expect,
        // but I didn't really want to add more specificity that would make this more brittle
        expect(workspaceInfo.blocks).to.not.be.empty;
    })

})