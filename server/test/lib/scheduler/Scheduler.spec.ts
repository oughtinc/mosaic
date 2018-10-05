import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";
import { Scheduler } from "../../../lib/scheduler/Scheduler";

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

const workspaces = [
  { id: "1", totalBudget: 100, allocatedBudget: 50 },
  { id: "1-1", totalBudget: 49, allocatedBudget: 0 },
  { id: "1-1-1", totalBudget: 100, allocatedBudget: 50 },
  { id: "2", totalBudget: 100, allocatedBudget: 50 },
  { id: "2-1", totalBudget: 100, allocatedBudget: 50 },
  { id: "2-2", totalBudget: 100, allocatedBudget: 0 },
  { id: "3", totalBudget: 100, allocatedBudget: 50 },
  { id: "4", totalBudget: 100, allocatedBudget: 50 },
  { id: "5", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-1", totalBudget: 100, allocatedBudget: 0 },
  { id: "5-2", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-3", totalBudget: 100, allocatedBudget: 50 },
  { id: "5-4", totalBudget: 100, allocatedBudget: 100 },
];

const fetchAllWorkspacesStub = () => workspaces;

describe("Scheduler class", () => {
  let fakeClock, schedule, scheduler;
  beforeEach(() => {
    fakeClock = sinon.useFakeTimers();
    schedule = new Schedule({
      rootParentFinder: rootParentFinderStub,
      timeLimit: ONE_MINUTE,
    });

    scheduler = new Scheduler({
      fetchAllWorkspaces: fetchAllWorkspacesStub,
      rootParentFinder: rootParentFinderStub,
      schedule,
    });
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  describe("filterByEligibility method", () => {
    it("excludes workspaces currently being worked on", done => {
      schedule.assignWorkspaceToUser(userId, "1-1");

      const promise = scheduler.filterByEligibility(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "1-1"));
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("doesn't exclude a workspace that was worked on but time limit has passed", done => {
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(ONE_MINUTE + 100);

      const promise = scheduler.filterByEligibility(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces);
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("doesn't exclude a workspace that was worked on but user has started different workspace", done => {
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);

      schedule.assignWorkspaceToUser(userId, "2");

      const promise = scheduler.filterByEligibility(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "2"));
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  describe("filterByWhetherInTreeWorkedOnLeastRecently", () => {
    it("works in straightforward case", done => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1-1");

      const promise = scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works in more complicated case", done => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2");

      const promise = scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
          &&
          w.id !== "2" && w.id !== "2-1" && w.id !== "2-2"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works when only one tree hasn't been worked on", done => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "4");

      const promise = scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => w.id === "3"));
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works when every tree has been worked on", done => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "4");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "3");

      const promise = scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id === "2" || w.id === "2-1" || w.id === "2-2"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });

  });

  describe("filterByWhetherNotYetWorkedOn", () => {
    it("works in straightforward case", done => {
      schedule.assignWorkspaceToUser(user1Id, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);
      schedule.assignWorkspaceToUser(user2Id, "2");

      const promise = scheduler.filterByWhetherNotYetWorkedOn(workspaces);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id !== "1-1" && w.id !== "2"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  describe("filterByWhetherHasRemainingBudget", () => {
    it("works in straightforward case", () => {
      const result = scheduler.filterByWhetherHasRemainingBudget(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "5-4"
      )));
    });
  });

  describe("getWorkspacesThatCouldBeNext", () => {
    it("works in a straightforward case", done => {
      schedule.assignWorkspaceToUser(user1Id, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);
      schedule.assignWorkspaceToUser(user2Id, "2");

      const promise = scheduler.getWorkspacesThatCouldBeNext(user1Id);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
          &&
          w.id !== "2" && w.id !== "2-1" && w.id !== "2-2"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });

    it("works when all workspaces assigned at least once", done => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "4");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "3");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(userId, "2");

      // NOTE 5-1 is excluded because it's currently being worked on!
      const promise = scheduler.getWorkspacesThatCouldBeNext(user1Id);
      promise.then(result => {
        expect(result).to.have.deep.members(workspaces.filter(w => (
          w.id === "5" || w.id === "5-2" || w.id === "5-3" || w.id === "5-4"
        )));
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

});
