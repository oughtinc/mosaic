import * as chai from "chai";
const { expect } = chai;
import { UserSchedule } from "../../../lib/scheduler/UserSchedule";

import {
  USER_ID,
  WORKSPACE_ID,
  WORKSPACE_ID_1,
  WORKSPACE_ID_2,
} from "./utils";

describe("UserSchedule class", function() {
  beforeEach(function() {
    this.userSchedule = new UserSchedule(USER_ID);;
  });

  describe("hasUserBeenAssignedToAnyWorkspaces method", function() {
    it("it knows if user has not been assigned to workspace", function() {
      expect(this.userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(false);
    });

    it("knows if user has been assigned to a workspaces", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID);
      expect(this.userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(true);
    });
  });

  describe("getMostRecentAssignment method", function() {
    it("returns undefined if user has not been assigned to any workspace", function() {
      expect(this.userSchedule.getMostRecentAssignment()).to.equal(undefined);
    });

    it("works with one assignment", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID);
      const mostRecentAssignment = this.userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(WORKSPACE_ID);
    });

    it("works with two assignments", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID_1);
      this.userSchedule.assignWorkspace(WORKSPACE_ID_2);
      const mostRecentAssignment = this.userSchedule.getMostRecentAssignment()
      expect(mostRecentAssignment.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("hasUserWorkedOnWorkspace method", function() {
    it("returns false if user has not been assigned to any workspace", function() {
      expect(this.userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID)).to.equal(false);
    });

    it("returns true if user has worked on workspace", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID);
      expect(this.userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID)).to.equal(true);
    });

    it("returns false if user has worked on workspace but not one asked about", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID_1);
      expect(this.userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_2)).to.equal(false);
    });

    it("returns true if user has worked on 2 workspaces", function() {
      this.userSchedule.assignWorkspace(WORKSPACE_ID_1);
      this.userSchedule.assignWorkspace(WORKSPACE_ID_2);
      expect(this.userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_1)).to.equal(true);
      expect(this.userSchedule.hasUserWorkedOnWorkspace(WORKSPACE_ID_2)).to.equal(true);
    });
  });
});
