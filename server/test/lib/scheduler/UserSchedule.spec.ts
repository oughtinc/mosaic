import * as chai from "chai";
const { expect } = chai;
import { UserSchedule } from "../../../lib/scheduler/UserSchedule";

import {
  USER_ID,
  workspaces,
} from "./utils";

describe("UserSchedule class", function() {
  before(function() {
    this.userSchedule = new UserSchedule(USER_ID);
  });

  afterEach(function() {
    this.userSchedule = new UserSchedule(USER_ID);
  });

  describe("hasUserBeenAssignedToAnyWorkspaces method", function() {
    context("with a user that has not been assigned to workspace", function() {
      it("returns false", function() {
        expect(this.userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(false);
      });
    });

    context("with a user that has been assigned to a workspace", function() {
      it("returns true", function() {
        this.userSchedule.assignWorkspace(workspaces[0]);
        expect(this.userSchedule.hasUserBeenAssignedToAnyWorkspaces()).to.equal(true);
      });
    });
  });

  describe("getMostRecentAssignment method", function() {
    context("with a user that has not been assigned to workspace", function() {
      it("returns undefined", function() {
        expect(this.userSchedule.getMostRecentAssignment()).to.equal(undefined);
      });
    });

    context("with a user that has been assigned a workspace once", function() {
      it("returns that workspace", function() {
        this.userSchedule.assignWorkspace(workspaces[0]);
        const mostRecentAssignment = this.userSchedule.getMostRecentAssignment()
        expect(mostRecentAssignment.getWorkspace()).to.equal(workspaces[0]);
      });
    });

    context("with a user that has been assigned two workspaces", function() {
      it("returns the most recently assigned workspace", function() {
        this.userSchedule.assignWorkspace(workspaces[1]);
        this.userSchedule.assignWorkspace(workspaces[2]);
        const mostRecentAssignment = this.userSchedule.getMostRecentAssignment()
        expect(mostRecentAssignment.getWorkspace()).to.equal(workspaces[2]);
      });
    });
  });

  describe("hasUserWorkedOnWorkspace method", function() {
    context("with a user that has not been assigned to any workspace", function() {
      it("returns false", function() {
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces[0])).to.equal(false);
      });
    });

    context("with a user that has been assigned to a workspace once", function() {
      it("returns true for assigned workspace", function() {
        this.userSchedule.assignWorkspace(workspaces[0]);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces[0])).to.equal(true);
      });

      it("returns false for other workspace", function() {
        this.userSchedule.assignWorkspace(workspaces[1]);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces[2])).to.equal(false);
      });
    });

    context("with a user that has been assigned to two workspaces", function() {
      it("returns true for both", function() {
        this.userSchedule.assignWorkspace(workspaces[1]);
        this.userSchedule.assignWorkspace(workspaces[2]);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces[1])).to.equal(true);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces[2])).to.equal(true);
      });
    });
  });
});
