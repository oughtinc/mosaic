import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";

const userId = "user";
const user1Id = "user1Id";
const user2Id = "user2Id";
const workspaceId = "workspace";
const workspace1Id = "workspace1";
const workspace2Id = "workspace2";
const workspace3Id = "workspace3";

const ONE_MINUTE = 60 * 1000;

const rootParentFinderStub = {
  getRootParentIdOfWorkspace(workspaceId) {
    return workspaceId[0];
  }
};

describe("Schedule class", () => {
  let fakeClock, schedule;
  beforeEach(() => {
    fakeClock = sinon.useFakeTimers();
    schedule = new Schedule({
      rootParentFinder: rootParentFinderStub,
      timeLimit: ONE_MINUTE,
    });
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  // tests private method, maybe remove
  describe("doesUserHaveASchedule", () => {
    it("works when user doesn't have a schedule", () => {
      expect(schedule.doesUserHaveASchedule(userId)).to.equal(false);
    });

    it("works when user has a schedule", () => {
      schedule.createUserSchedule(userId);
      expect(schedule.doesUserHaveASchedule(userId)).to.equal(true);
    });
  });

  // tests private method, maybe remove
  describe("getUserSchedule", () => {
    it("returns undefined when user doesn't have schedule", () => {
      expect(schedule.getUserSchedule(userId)).to.equal(undefined);
    });

    it("returns schedule when user has schedule", () => {
      schedule.createUserSchedule(userId);
      expect(schedule.getUserSchedule(userId)).to.be.a("object");
    });
  });

  describe("assignWorkspaceToUser", () => {
    it("works with one assignment", () => {
      schedule.assignWorkspaceToUser(userId, workspaceId);
      const assignment = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment.getWorkspaceId()).to.equal(workspaceId);
    });

    it("works with two assignments", () => {
      schedule.assignWorkspaceToUser(userId, workspace1Id);
      const assignment1 = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment1.getWorkspaceId()).to.equal(workspace1Id);

      schedule.assignWorkspaceToUser(userId, workspace2Id);
      const assignment2 = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment2.getWorkspaceId()).to.equal(workspace2Id);
    });

    it("works with three assignments", () => {
      schedule.assignWorkspaceToUser(userId, workspace1Id);
      const assignment1 = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment1.getWorkspaceId()).to.equal(workspace1Id);

      schedule.assignWorkspaceToUser(userId, workspace2Id);
      const assignment2 = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment2.getWorkspaceId()).to.equal(workspace2Id);

      schedule.assignWorkspaceToUser(userId, workspace3Id);
      const assignment2 = schedule.getMostRecentAssignmentForUser(userId);
      expect(assignment2.getWorkspaceId()).to.equal(workspace3Id);
    });

    it("works with two users and three assignments", () => {
      schedule.assignWorkspaceToUser(user1Id, workspace1Id);
      const assignment1 = schedule.getMostRecentAssignmentForUser(user1Id);
      expect(assignment1.getWorkspaceId()).to.equal(workspace1Id);

      schedule.assignWorkspaceToUser(user2Id, workspace2Id);
      const assignment2 = schedule.getMostRecentAssignmentForUser(user2Id);
      expect(assignment1.getWorkspaceId()).to.equal(workspace1Id);
      expect(assignment2.getWorkspaceId()).to.equal(workspace2Id);
    });
  });

  describe("isWorkspaceCurrentlyBeingWorkedOn", () => {
    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(userId, workspaceId);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaceId)).to.equal(true);
    });

    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(userId, workspaceId);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaceId)).to.equal(true);

      fakeClock.tick(ONE_MINUTE - 1);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaceId)).to.equal(true);

      fakeClock.tick(2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspaceId)).to.equal(false);
    });

    it("works in re-assigned case", () => {
      schedule.assignWorkspaceToUser(userId, workspace1Id);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace1Id)).to.equal(true);

      fakeClock.tick(ONE_MINUTE / 2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace1Id)).to.equal(true);

      schedule.assignWorkspaceToUser(userId, workspace2Id);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace1Id)).to.equal(false);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace2Id)).to.equal(true);

      fakeClock.tick(ONE_MINUTE - 1);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace2Id)).to.equal(true);

      fakeClock.tick(2);
      expect(schedule.isWorkspaceCurrentlyBeingWorkedOn(workspace2Id)).to.equal(false);
    });
  });

  describe("hasWorkspaceBeenWorkedOnYet", () => {
    it("works when hasn't", () => {
      expect(schedule.hasWorkspaceBeenWorkedOnYet(workspaceId)).to.equal(false);
    });

    it("works when has", () => {
      schedule.assignWorkspaceToUser(userId, workspace1Id);
      expect(schedule.hasWorkspaceBeenWorkedOnYet(workspace1Id)).to.equal(true);
      expect(schedule.hasWorkspaceBeenWorkedOnYet(workspace2Id)).to.equal(false);
    });
  });

  describe("getTimestampWorkspaceLastWorkedOn", () => {
    it("works in straightforward case", () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, workspaceId);
      expect(schedule.getTimestampWorkspaceLastWorkedOn(workspaceId)).to.equal(100);
    });

    it("works in case when assigned multiple times", () => {
      schedule.assignWorkspaceToUser(user1Id, workspaceId);
      fakeClock.tick(ONE_MINUTE);
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(user2Id, workspaceId);

      expect(schedule.getTimestampWorkspaceLastWorkedOn(workspaceId)).to.equal(ONE_MINUTE + 100);
    });
  });

  describe("getWhichOfTheseWorkspacesWorkedOnLeastRecently", () => {
    it("works in straightforward case", () => {
      schedule.assignWorkspaceToUser(user1Id, workspace1Id);
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(user2Id, workspace2Id);

      const result = schedule.getWhichOfTheseWorkspacesWorkedOnLeastRecently([workspace1Id, workspace2Id]);
      expect(result).to.equal(workspace1Id);
    });

    it("works in case where only one has never been worked on", () => {
      schedule.assignWorkspaceToUser(user1Id, workspace1Id);

      const result = schedule.getWhichOfTheseWorkspacesWorkedOnLeastRecently([workspace1Id, workspace2Id]);
      expect(result).to.equal(workspace2Id);
    });
  });

  describe("getTreesWorkedOnLeastRecently", () => {
    it("works in straightforward case", done => {
      schedule.assignWorkspaceToUser(user1Id, "1-1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(user2Id, "2");

      const promise = schedule.getTreesWorkedOnLeastRecently(["1-1", "2"]);

      promise.then(result => {
        expect(result).to.have.deep.members(["1"]);
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works in more complicated case", done => {
      schedule.assignWorkspaceToUser(user1Id, "1-1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(user2Id, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(user2Id, "1-2");

      const promise = schedule.getTreesWorkedOnLeastRecently(["1-1", "1-2", "2"]);

      promise.then(result => {
        expect(result).to.have.deep.members(["2"]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  describe("isInTreeWorkedOnLeastRecently", () => {
    it("works in straightforward case", done => {
      schedule.assignWorkspaceToUser(user1Id, "1");
      fakeClock.tick(ONE_MINUTE);
      schedule.assignWorkspaceToUser(user2Id, "2");

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
      schedule.assignWorkspaceToUser(user1Id, "1-1-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "2-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "3");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "2");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "2-2");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "3-1");
      fakeClock.tick(1);
      schedule.assignWorkspaceToUser(user2Id, "2");

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
