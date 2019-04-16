import * as chai from "chai";
const { expect } = chai;
import { rootWorkspaceQuestion } from "../../testHelpers/slateHelpers";
import Workspace from "../../../lib/models/workspace";
import db from "../../../lib/models";

describe("WorkspaceModel", () => {
  describe("subtreeWorkspaces", () => {
    context("a workspace with no child workspaces", () => {
      beforeEach(() => db.sync({ force: true }));

      it("should not return anything", async () => {
        const totalBudget = 1000;
        const creatorId = "testcreatorId";
        const question = rootWorkspaceQuestion("Mock workspace name");
        const workspace = await Workspace.create(
          { totalBudget, creatorId },
          { questionValue: JSON.parse(question) }
        );
        const childWorkspaces = await workspace.getChildWorkspaces();
        expect(childWorkspaces).to.be.empty;
      });
    });
  });
});
