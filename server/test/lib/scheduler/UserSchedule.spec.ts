import * as chai from "chai";
const { expect } = chai;
import { UserSchedule } from "../../../lib/scheduler/UserSchedule";

import {
  USER_ID,
  WORKSPACE_ID,
  WORKSPACE_ID_1,
  WORKSPACE_ID_2,
} from "./utils";

describe("UserSchedule class", () => {
  let userSchedule;
  beforeEach(() => {
    userSchedule = new UserSchedule(USER_ID);;
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  describe("hasUserBeenAssignedToAnyWorkspaces method", () => {
    it("it knows if user has not been assigned to workspace", () => {
      expect(userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(false);
    });

    it("knows if user has been assigned to a workspaces", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID);
      expect(userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(true);
    });
  });

  describe("getMostRecentAssignment method", () => {
    it("returns undefined if user has not been assigned to any workspace", () => {
      expect(userSchedule.getMostRecentAssignment()).to.equal(undefined);
    });

    it("works with one assignment", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID);
      const mostRecentAssignment = userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(WORKSPACE_ID);
    });

    it("works with two assignments", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID_1);
      userSchedule.assignWorkspace(WORKSPACE_ID_2);
      const mostRecentAssignment = userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("hasUserWorkedOnWorkspace method", () => {
    it("returns false if user has not been assigned to any workspace", () => {
      expect(userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID)).to.equal(false);
    });

    it("returns true if user has worked on workspace", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID);
      expect(userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID)).to.equal(true);
    });

    it("returns false if user has worked on workspace but not one asked about", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID_1);
      expect(userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_2)).to.equal(false);
    });

    it("returns true if user has worked on 2 workspaces", () => {
      userSchedule.assignWorkspace(WORKSPACE_ID_1);
      userSchedule.assignWorkspace(WORKSPACE_ID_2);
      expect(userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_1)).to.equal(true);
      expect(userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_2)).to.equal(true);
    });
  });
});
