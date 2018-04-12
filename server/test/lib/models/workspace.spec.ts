import * as chai from "chai";
const { expect } = chai;
import { truncateDb } from "../../testHelpers/sequelizeHelpers";
import { rootWorkspaceQuestion } from "../../testHelpers/slateHelpers";
import WorkspaceModel from "../../../lib/models/workspace";
import * as models from "../../../lib/models";

describe('WorkspaceModel', () => {
    describe('subtreeWorkspaces', () => {
        
        // a lame test, but just wanted to get something working quickly
        // to show the testing pattern.
        context('a workspace with no child workspaces', () => {
            beforeEach(() => truncateDb());
            it('should not return anything', async () => {
                const totalBudget = 1000;
                const question = rootWorkspaceQuestion('Mock workspace name');
                const event = await models.Event.create();
                const workspace = await models.Workspace.create({ totalBudget }, { event, questionValue: JSON.parse(question) });
                const subtreeWorkspaces = await workspace.subtreeWorkspaces();
                expect(subtreeWorkspaces).to.be.empty;
            });
        })
    });
})