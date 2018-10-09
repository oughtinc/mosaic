import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";

import {
  USER_ID,
  USER_ID_1,
  USER_ID_2,
  WORKSPACE_ID,
  WORKSPACE_ID_1,
  WORKSPACE_ID_2,
  WORKSPACE_ID_3,
  rootParentCacheFake,
} from "./utils";

const ONE_MINUTE = 60 * 1000;

describe("Schedule class", function() {
  beforeEach(function() {
    this.clock = sinon.useFakeTimers();
    this.schedule = new Schedule({
      rootParentCache: rootParentCacheFake,
      timeLimit: ONE_MINUTE,
    });
  });

  after(function() {
    this.clock.restore();
  });

  // tests private method, maybe remove
  describe("doesUserHaveASchedule", function () {
    it("works when user doesn't have a schedule", function () {
      expect(this.schedule.doesUserHaveASchedule(USER_ID)).to.equal(false);
    });

    it("works when user has a schedule", function () {
      this.schedule.createUserSchedule(USER_ID);
      expect(this.schedule.doesUserHaveASchedule(USER_ID)).to.equal(true);
    });
  });

  // tests private method, maybe remove
  describe("getUserSchedule", function() {
    it("returns undefined when user doesn't have schedule", function() {
      expect(this.schedule.getUserSchedule(USER_ID)).to.equal(undefined);
    });

    it("returns schedule when user has schedule", function() {
      this.schedule.createUserSchedule(USER_ID);
      expect(this.schedule.getUserSchedule(USER_ID)).to.be.a("object");
    });
  });

  describe("assignWorkspaceToUser", function() {
    it("works with one assignment", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      const assignment = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment.getWorkspaceId()).to.equal(WORKSPACE_ID);
    });

    it("works with two assignments", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });

    it("works with three assignments", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);

      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_3);
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_3);
    });

    it("works with two users and three assignments", function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(USER_ID_1);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      this.schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID_2);
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID_2);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("isWorkspaceCurrentlyBeingWorkedOn", function() {
    it("works in straightforward case", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);
    });

    it("works in straightforward case", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);

      this.clock.tick(ONE_MINUTE - 1);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);

      this.clock.tick(2);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(false);
    });

    it("works in re-assigned case", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(true);

      this.clock.tick(ONE_MINUTE / 2);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(true);

      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(false);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(true);

      this.clock.tick(ONE_MINUTE - 1);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(true);

      this.clock.tick(2);
      expect(this.schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(false);
    });
  });

  describe("hasWorkspaceBeenWorkedOnYet", function() {
    it("works when hasn't", function() {
      expect(this.schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID)).to.equal(false);
    });

    it("works when has", function() {
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      expect(this.schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID_1)).to.equal(true);
      expect(this.schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID_2)).to.equal(false);
    });
  });

  describe("getTimestampWorkspaceLastWorkedOn", function() {
    it("works in straightforward case", function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(this.schedule.getTimestampWorkspaceLastWorkedOn(WORKSPACE_ID)).to.equal(100);
    });

    it("works in case when assigned multiple times", function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID);
      this.clock.tick(ONE_MINUTE);
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID);

      expect(this.schedule.getTimestampWorkspaceLastWorkedOn(WORKSPACE_ID)).to.equal(ONE_MINUTE + 100);
    });
  });

  describe("getLeastRecentlyActiveWorkspace", function() {
    it("works in straightforward case", function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID_2);

      const result = this.schedule.getLeastRecentlyActiveWorkspace([WORKSPACE_ID_1, WORKSPACE_ID_2]);
      expect(result).to.equal(WORKSPACE_ID_1);
    });

    it("works in case where only one has never been worked on", function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);

      const result = this.schedule.getLeastRecentlyActiveWorkspace([WORKSPACE_ID_1, WORKSPACE_ID_2]);
      expect(result).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("getTreesWorkedOnLeastRecently", function() {
    it("works in straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");
      const result = await this.schedule.getTreesWorkedOnLeastRecently(["1-1", "2"]);
      expect(result).to.have.deep.members(["1"]);
    });

    it("works in more complicated case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "1-2");

      const result = await this.schedule.getTreesWorkedOnLeastRecently(["1-1", "1-2", "2"]);
      expect(result.length).to.equal(1);
      expect(result).to.have.deep.members(["2"]);
    });
  });

  describe("isInTreeWorkedOnLeastRecently", function() {
    it("works in straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1");
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await this.schedule.isInTreeWorkedOnLeastRecently(["1-1", "1-2", "2"], "1-1");
      expect(result).to.equal(true);
    });

    it("works in complicated case", async function() {
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1-1-1");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2-1");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "3");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2-2");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "1");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "3-1");
      this.clock.tick(1);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await this.schedule.isInTreeWorkedOnLeastRecently(["1", "2", "3"], "1-1");
      expect(result).to.equal(true);
    });
  });
});
