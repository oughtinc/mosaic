import * as chai from "chai";
const { expect } = chai;
import { UserSchedule } from "../../../lib/scheduler/UserSchedule";

const userId = "user1";
const workspaceId = "workspace";
const workspace1Id = "workspace1";
const workspace2Id = "workspace2";

describe("UserSchedule class", () => {
  let userSchedule;
  beforeEach(() => {
    userSchedule = new UserSchedule(userId);;
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  describe("hasUserBeenAssignedToAnyWorkspaces method", () => {
    it("it knows if user has not been assigned to workspace", () => {
      expect(userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(false);
    });

    it("knows if user has been assigned to a workspaces", () => {
      userSchedule.assignWorkspace(workspaceId);
      expect(userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(true);
    });
  });

  describe("getMostRecentAssignment method", () => {
    it("returns undefined if user has not been assigned to any workspace", () => {
      expect(userSchedule.getMostRecentAssignment()).to.equal(undefined);
    });

    it("works with one assignment", () => {
      userSchedule.assignWorkspace(workspaceId);
      const mostRecentAssignment = userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(workspaceId);
    });

    it("works with two assignments", () => {
      userSchedule.assignWorkspace(workspace1Id);
      userSchedule.assignWorkspace(workspace2Id);
      const mostRecentAssignment = userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(workspace2Id);
    });
  });

  describe("hasUserWorkedOnWorkspace method", () => {
    it("returns false if user has not been assigned to any workspace", () => {
      expect(userSchedule.hasUserWorkedOnWorkspace(workspaceId)).to.equal(false);
    });

    it("returns true if user has worked on workspace", () => {
      userSchedule.assignWorkspace(workspaceId);
      expect(userSchedule.hasUserWorkedOnWorkspace(workspaceId)).to.equal(true);
    });

    it("returns false if user has worked on workspace but not one asked about", () => {
      userSchedule.assignWorkspace(workspace1Id);
      expect(userSchedule.hasUserWorkedOnWorkspace(workspace2Id)).to.equal(false);
    });

    it("returns true if user has worked on 2 workspaces", () => {
      userSchedule.assignWorkspace(workspace1Id);
      userSchedule.assignWorkspace(workspace2Id);
      expect(userSchedule.hasUserWorkedOnWorkspace(workspace1Id)).to.equal(true);
      expect(userSchedule.hasUserWorkedOnWorkspace(workspace2Id)).to.equal(true);
    });
  });
});
