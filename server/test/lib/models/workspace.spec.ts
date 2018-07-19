import * as chai from "chai";
const { expect } = chai;
import { truncateDb } from "../../testHelpers/sequelizeHelpers";
import { rootWorkspaceQuestion } from "../../testHelpers/slateHelpers";
import WorkspaceModel from "../../../lib/models/workspace";
import * as models from "../../../lib/models";

describe("WorkspaceModel", () => {
  describe("subtreeWorkspaces", () => {
    context("a workspace with no child workspaces", () => {
      beforeEach(() => truncateDb());
      it("should not return anything", async () => {
        const totalBudget = 1000;
        const creatorId = "testcreatorId";
        const question = rootWorkspaceQuestion("Mock workspace name");
        const event = await models.Event.create();
        const workspace = await models.Workspace.create(
          { totalBudget, creatorId },
          { event, questionValue: JSON.parse(question) }
        );
        const childWorkspaces = await workspace.getChildWorkspaces();
        expect(childWorkspaces).to.be.empty;
      });
    });
  });
});
