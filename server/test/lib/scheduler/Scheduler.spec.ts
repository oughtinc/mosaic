import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";
import { Scheduler } from "../../../lib/scheduler/Scheduler";

import {
  USER_ID,
  USER_ID_1,
  USER_ID_2,
  WORKSPACE_ID,
  rootParentFinderFake
} from "./utils";

const ONE_MINUTE = 60 * 1000;

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

const fetchAllWorkspacesFake = () => workspaces;

describe("Scheduler class", () => {
  let fakeClock, schedule, scheduler;

  const resetBeforeTesting = () => {
    fakeClock = sinon.useFakeTimers();
    schedule = new Schedule({
      rootParentFinder: rootParentFinderFake,
      timeLimit: ONE_MINUTE,
    });

    scheduler = new Scheduler({
      fetchAllWorkspaces: fetchAllWorkspacesFake,
      rootParentFinder: rootParentFinderFake,
      schedule,
    });
  };

  beforeEach(resetBeforeTesting);

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  describe("filterByEligibility method", () => {
    it("excludes workspaces currently being worked on", async () => {
      schedule.assignWorkspaceToUser(USER_ID, "1-1");

      const result = await scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "1-1"));
    });

    it("doesn't exclude a workspace that was worked on but time limit has passed", async () => {
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(ONE_MINUTE + 100);

      const result = await scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces);
    });

    it("doesn't exclude a workspace that was worked on but user has started different workspace", async () => {
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);

      schedule.assignWorkspaceToUser(USER_ID, "2");

      const result = await scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "2"));
    });
  });

  describe("filterByWhetherInTreeWorkedOnLeastRecently", () => {
    it("works in straightforward case", async () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1-1");

      const result = await scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
      )));
    });

    it("works in more complicated case", async () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2");

      const result = await scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
        &&
        w.id !== "2" && w.id !== "2-1" && w.id !== "2-2"
      )));
    });

    it("works when only one tree hasn't been worked on", async () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "4");

      const result = await scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id === "3"));
    });

    it("works when every tree has been worked on", async () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "4");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "3");

      const result = await scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id === "2" || w.id === "2-1" || w.id === "2-2"
      )));
    });

  });

  describe("filterByWhetherNotYetWorkedOn", () => {
    it("works in straightforward case", async () => {
      schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await scheduler.filterByWhetherNotYetWorkedOn(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1-1" && w.id !== "2"
      )));
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

  describe("getIdsOfWorkspacesThatCouldBeNext", () => {
    it("works in a straightforward case", async () => {
      schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      fakeClock.tick(ONE_MINUTE / 2);
      schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await scheduler.getIdsOfWorkspacesThatCouldBeNext(USER_ID_1);
      expect(result).to.have.deep.members(["3", "4", "5", "5-1", "5-2", "5-3", "5-4"]);
    });

    it("works when all workspaces assigned at least once", async () => {
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "5-1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "1");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "4");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "3");
      fakeClock.tick(100);
      schedule.assignWorkspaceToUser(USER_ID, "2");

      // NOTE 5-1 is excluded because it's currently being worked on!
      const result = await scheduler.getIdsOfWorkspacesThatCouldBeNext(USER_ID_1);
      expect(result).to.have.deep.members(["5", "5-2", "5-3", "5-4"]);
    });
  });

  describe("findNextWorkspace", () => {
    it("works in a straightforward case", async () => {
      await scheduler.findNextWorkspace(USER_ID_1);
      const result = await scheduler.getIdOfCurrentWorkspace(USER_ID_1);
      expect(result).to.be.oneOf([
        "1",
        "1-1",
        "1-1-1",
        "2",
        "2-1",
        "2-2",
        "3",
        "4",
        "5",
        "5-1",
        "5-2",
        "5-3",
        "5-4",
      ]);
    });
  });

});
