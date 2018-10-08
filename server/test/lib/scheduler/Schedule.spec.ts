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
  rootParentFinderFake,
} from "./utils";

const ONE_MINUTE = 60 * 1000;

describe("Schedule class", () => {
  let fakeClock, schedule;
  beforeEach(() => {
    fakeClock = sinon.useFakeTimers();
    schedule = new Schedule({
      rootParentFinder: rootParentFinderFake,
      timeLimit: ONE_MINUTE,
    });
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  // tests private method, maybe remove
  describe("doesUserHaveASchedule", () => {
    it("works when user doesn't have a schedule", () => {
      expect(schedule.doesUserHaveASchedule(USER_ID)).to.equal(false);
    });

    it("works when user has a schedule", () => {
      schedule.createUserSchedule(USER_ID);
      expect(schedule.doesUserHaveASchedule(USER_ID)).to.equal(true);
    });
  });

  // tests private method, maybe remove
  describe("getUserSchedule", () => {
    it("returns undefined when user doesn't have schedule", () => {
      expect(schedule.getUserSchedule(USER_ID)).to.equal(undefined);
    });

    it("returns schedule when user has schedule", () => {
      schedule.createUserSchedule(USER_ID);
      expect(schedule.getUserSchedule(USER_ID)).to.be.a("object");
    });
  });

  describe("assignWorkspaceToUser", () => {
    it("works with one assignment", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      const assignment = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment.getWorkspaceId()).to.equal(WORKSPACE_ID);
    });

    it("works with two assignments", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      const assignment1 = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      const assignment2 = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });

    it("works with three assignments", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      const assignment1 = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      const assignment2 = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);

      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_3);
      const assignment2 = schedule.getMostRecentAssignmentForUser(USER_ID);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_3);
    });

    it("works with two users and three assignments", () => {
      schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);
      const assignment1 = schedule.getMostRecentAssignmentForUser(USER_ID_1);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);

      schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID_2);
      const assignment2 = schedule.getMostRecentAssignmentForUser(USER_ID_2);
      expect(assignment1.getWorkspaceId()).to.equal(WORKSPACE_ID_1);
      expect(assignment2.getWorkspaceId()).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("isWorkspaceCurrentlyBeingWorkedOn", () => {
    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);
    });

    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);

      fakeClock.tick(ONE_MINUTE - 1);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(true);

      fakeClock.tick(2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID)).to.equal(false);
    });

    it("works in re-assigned case", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(true);

      fakeClock.tick(ONE_MINUTE / 2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(true);

      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_1)).to.equal(false);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(true);

      fakeClock.tick(ONE_MINUTE - 1);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(true);

      fakeClock.tick(2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(WORKSPACE_ID_2)).to.equal(false);
    });
  });

  describe("hasWorkspaceBeenWorkedOnYet", () => {
    it("works when hasn't", () => {
      expect(schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID)).to.equal(false);
    });

    it("works when has", () => {
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID_1);
      expect(schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID_1)).to.equal(true);
      expect(schedule.hasWorkspaceBeenWorkedOnYet(WORKSPACE_ID_2)).to.equal(false);
    });
  });

  describe("getTimestampWorkspaceLastWorkedOn", () => {
    it("works in straightforward case", () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, WORKSPACE_ID);
      expect(schedule.getTimestampWorkspaceLastWorkedOn(WORKSPACE_ID)).to.equal(100);
    });

    it("works in case when assigned multiple times", () => {
      schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID);
      fakeClock.tick(ONE_MINUTE);
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID);

      expect(schedule.getTimestampWorkspaceLastWorkedOn(WORKSPACE_ID)).to.equal(ONE_MINUTE + 100);
    });
  });

  describe("getWhichOfTheseWorkspacesWorkedOnLeastRecently", () => {
    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(USER_ID_2, WORKSPACE_ID_2);

      const result = schedule.getWhichOfTheseWorkspacesWorkedOnLeastRecently([WORKSPACE_ID_1, WORKSPACE_ID_2]);
      expect(result).to.equal(WORKSPACE_ID_1);
    });

    it("works in case where only one has never been worked on", () => {
      schedule.assignWorkspaceToUser(USER_ID_1, WORKSPACE_ID_1);

      const result = schedule.getWhichOfTheseWorkspacesWorkedOnLeastRecently([WORKSPACE_ID_1, WORKSPACE_ID_2]);
      expect(result).to.equal(WORKSPACE_ID_2);
    });
  });

  describe("getTreesWorkedOnLeastRecently", () => {
    it("works in straightforward case", done => {
      schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const promise = schedule.getTreesWorkedOnLeastRecently(["1-1", "2"]);

      promise.then(result => {
        expect(result).to.have.deep.members(["1"]);
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works in more complicated case", done => {
      schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID_2, "1-2");

      const promise = schedule.getTreesWorkedOnLeastRecently(["1-1", "1-2", "2"]);

      promise.then(result => {
        expect(result.length).to.equal(1);
        expect(result).to.have.deep.members(["2"]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  describe("isInTreeWorkedOnLeastRecently", () => {
    it("works in straightforward case", done => {
      schedule.assignWorkspaceToUser(USER_ID_1, "1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const promise = schedule.isInTreeWorkedOnLeastRecently(["1-1", "1-2", "2"], "1-1");

      promise.then(result => {
        expect(result).to.equal(true);
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works in complicated case", done => {
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_1, "1-1-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "2-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "3");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "2-2");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "3-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const promise = schedule.isInTreeWorkedOnLeastRecently(["1", "2", "3"], "1-1");

      promise.then(result => {
        expect(result).to.equal(true);
        done();
      }).catch(e => {
        done(e);
      });

    });
  });
});
