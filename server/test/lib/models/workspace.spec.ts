import * as chai from "chai";
const { expect } = chai;
import { truncateDb } from "../../testHelpers/sequelizeHelpers";
import WorkspaceModel from "../../../lib/models/workspace";
import * as models from "../../../lib/models";

describe('WorkspaceModel', () => {
    describe('subtreeWorkspaces', () => {
        
        // a lame test, but just wanted to get something working quickly
        // to show the testing pattern.
        context('when there are no subtree workspaces', () => {
            beforeEach(() => truncateDb());
            it('should not return anything', async () => {
                const totalBudget = 1000;
                const question = "{\"object\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"object\":\"text\",\"leaves\":[{\"object\":\"leaf\",\"text\":\"Fake root workspace\",\"marks\":[]}]}]}";
                const event = await models.Event.create();
                const workspace = await models.Workspace.create({ totalBudget }, { event, questionValue: JSON.parse(question) });
                const subtreeWorkspaces = await workspace.subtreeWorkspaces();
                expect(subtreeWorkspaces).to.be.empty;
            });
        })
    });
})