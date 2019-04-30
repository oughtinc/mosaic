import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";

import {
  USER_ID,
  USER_ID_1,
  USER_ID_2,
  workspaces,
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

  describe("doesUserHaveASchedule", function() {
    context("with a user that doesn't have a schedule", function() {
      it("returns false", function() {
        expect(this.schedule.doesUserHaveASchedule(USER_ID)).to.equal(false);
      });
    });

    context("with a user that has a schedule", function() {
      it("returns true", function() {
        this.schedule.createUserScheduleIfNotCreated(USER_ID);
        expect(this.schedule.doesUserHaveASchedule(USER_ID)).to.equal(true);
      });
    });
  });

  describe("getUserSchedule", function() {
    context("with a user that doesn't have a schedule", function() {
      it("returns undefined", function() {
        expect(this.schedule.getUserSchedule(USER_ID)).to.equal(undefined);
      });
    });

    context("with a user that has a schedule", function() {
      it("returns user's schedule", function() {
        this.schedule.createUserScheduleIfNotCreated(USER_ID);
        expect(this.schedule.getUserSchedule(USER_ID)).to.be.a("object");
      });
    });
  });

  describe("assignWorkspaceToUser", function() {
    it("works with one assignment", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      const assignment = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment.getWorkspace()).to.equal(workspaces.get("1"));
    });

    it("works with two assignments", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspace()).to.equal(workspaces.get("1-1"));

      await this.schedule.assignWorkspaceToUser(
        USER_ID,
        workspaces.get("1-1-1"),
      );
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspace()).to.equal(workspaces.get("1-1-1"));
    });

    it("works with three assignments", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspace()).to.equal(workspaces.get("1-1"));

      await this.schedule.assignWorkspaceToUser(
        USER_ID,
        workspaces.get("1-1-1"),
      );
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspace()).to.equal(workspaces.get("1-1-1"));

      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspace()).to.equal(workspaces.get("2"));
    });

    it("works with two users and three assignments", async function() {
      await this.schedule.assignWorkspaceToUser(
        USER_ID_1,
        workspaces.get("1-1"),
      );
      const assignment1 = this.schedule.getMostRecentAssignmentForUser(
        USER_ID_1,
      );
      expect(assignment1.getWorkspace()).to.equal(workspaces.get("1-1"));

      await this.schedule.assignWorkspaceToUser(
        USER_ID_2,
        workspaces.get("1-1-1"),
      );
      const assignment2 = this.schedule.getMostRecentAssignmentForUser(
        USER_ID_2,
      );
      expect(assignment1.getWorkspace()).to.equal(workspaces.get("1-1"));
      expect(assignment2.getWorkspace()).to.equal(workspaces.get("1-1-1"));
    });
  });

  describe("isWorkspaceCurrentlyBeingWorkedOn", function() {
    it("works in straightforward case", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1")),
      ).to.equal(true);
    });

    it("works in straightforward case", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1")),
      ).to.equal(true);

      this.clock.tick(ONE_MINUTE - 1);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1")),
      ).to.equal(true);

      this.clock.tick(2);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1")),
      ).to.equal(false);
    });

    it("works in re-assigned case", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1-1")),
      ).to.equal(true);

      this.clock.tick(ONE_MINUTE / 2);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1-1")),
      ).to.equal(true);

      await this.schedule.assignWorkspaceToUser(
        USER_ID,
        workspaces.get("1-1-1"),
      );
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaces.get("1-1")),
      ).to.equal(false);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(
          workspaces.get("1-1-1"),
        ),
      ).to.equal(true);

      this.clock.tick(ONE_MINUTE - 1);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(
          workspaces.get("1-1-1"),
        ),
      ).to.equal(true);

      this.clock.tick(2);
      expect(
        this.schedule.isWorkspaceCurrentlyBeingWorkedOn(
          workspaces.get("1-1-1"),
        ),
      ).to.equal(false);
    });
  });

  describe("hasWorkspaceBeenWorkedOnYet", function() {
    it("works when hasn't", function() {
      expect(
        this.schedule.hasWorkspaceBeenWorkedOnYet(workspaces.get("1")),
      ).to.equal(false);
    });

    it("works when has", async function() {
      await this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      expect(
        this.schedule.hasWorkspaceBeenWorkedOnYet(workspaces.get("1-1")),
      ).to.equal(true);
      expect(
        this.schedule.hasWorkspaceBeenWorkedOnYet(workspaces.get("1-1-1")),
      ).to.equal(false);
    });
  });

  describe("getTreesWorkedOnLeastRecently", function() {
    it("works in straightforward case", async function() {
      await this.schedule.assignWorkspaceToUser(
        USER_ID_1,
        workspaces.get("1-1"),
      );
      this.clock.tick(ONE_MINUTE);
      await this.schedule.assignWorkspaceToUser(USER_ID_2, workspaces.get("2"));
      const result = await this.schedule.getTreesWorkedOnLeastRecently([
        workspaces.get("1"),
        workspaces.get("2"),
      ]);
      expect(result).to.have.deep.members([workspaces.get("1")]);
    });

    it("works in more complicated case", async function() {
      await this.schedule.assignWorkspaceToUser(
        USER_ID_1,
        workspaces.get("1-1"),
      );
      this.clock.tick(ONE_MINUTE);
      await this.schedule.assignWorkspaceToUser(USER_ID_2, workspaces.get("2"));
      this.clock.tick(100);
      await this.schedule.assignWorkspaceToUser(
        USER_ID_2,
        workspaces.get("1-1-1"),
      );

      const result = await this.schedule.getTreesWorkedOnLeastRecently([
        workspaces.get("1"),
        workspaces.get("2"),
      ]);
      expect(result.length).to.equal(1);
      expect(result).to.have.deep.members([workspaces.get("2")]);
    });
  });
});
