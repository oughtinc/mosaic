import * as chai from "chai";
import db from "../../../lib/models";
import { createRootWorkspace } from "../../testHelpers/graphQLCalls";
import { rootWorkspaceQuestion } from "../../testHelpers/slateHelpers";

describe("graphQL schema", () => {
  describe("createWorkspace", () => {
    beforeEach(() => db.sync({ force: true }));

    it("should create a workspace", async () => {
      const totalBudget = 1000;
      const question = rootWorkspaceQuestion("Mock workspace name");
      const creatorId = "testcreatorId";
      const rootWorkspace = await createRootWorkspace(
        totalBudget,
        question,
        creatorId
      );
      const workspaceInfo =
        rootWorkspace.data && rootWorkspace.data.createWorkspace;
    });
  });
});
