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
  rootParentCacheFake
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

describe("Scheduler class", function() {
  const resetBeforeTesting = function() {
    this.clock = sinon.useFakeTimers();
    this.schedule = new Schedule({
      rootParentCache: rootParentCacheFake,
      timeLimit: ONE_MINUTE,
    });

    this.scheduler = new Scheduler({
      fetchAllWorkspaces: fetchAllWorkspacesFake,
      rootParentCache: rootParentCacheFake,
      schedule: this.schedule,
    });
  };

  beforeEach(resetBeforeTesting);

  after(function() {
    this.clock.restore();
  });

  describe("filterByEligibility method", function() {
    it("excludes workspaces currently being worked on", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "1-1"));
    });

    it("doesn't exclude a workspace that was worked on but time limit has passed", async function() {
      this.schedule .assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(ONE_MINUTE + 100);

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces);
    });

    it("doesn't exclude a workspace that was worked on but user has started different workspace", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(ONE_MINUTE / 2);

      this.schedule.assignWorkspaceToUser(USER_ID, "2");

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id !== "2"));
    });
  });

  describe("filterByWhetherInTreeWorkedOnLeastRecently", function() {
    it("works in straightforward case", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
      )));
    });

    it("works in more complicated case", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2");

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1" && w.id !== "1-1" && w.id !== "1-1-1"
        &&
        w.id !== "2" && w.id !== "2-1" && w.id !== "2-2"
      )));
    });

    it("works when only one tree hasn't been worked on", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "5-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "4");

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w.id === "3"));
    });

    it("works when every tree has been worked on", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "5-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "4");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "3");

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id === "2" || w.id === "2-1" || w.id === "2-2"
      )));
    });

  });

  describe("filterByWhetherNotYetWorkedOn", function() {
    it("works in straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      this.clock.tick(ONE_MINUTE / 2);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await this.scheduler.filterByWhetherNotYetWorkedOn(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "1-1" && w.id !== "2"
      )));
    });
  });

  describe("filterByWhetherHasRemainingBudget", function() {
    it("works in straightforward case", function() {
      const result = this.scheduler.filterByWhetherHasRemainingBudget(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w.id !== "5-4"
      )));
    });
  });

  describe("getWorkspacesThatCouldBeNext", function() {
    it("works in a straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, "1-1");
      this.clock.tick(ONE_MINUTE / 2);
      this.schedule.assignWorkspaceToUser(USER_ID_2, "2");

      const result = await this.scheduler.getWorkspacesThatCouldBeNext(USER_ID_1);
      expect(result).to.have.deep.members(workspaces.filter(
        w => w.id === "3" || w.id === "4" || w.id == "5" || w.id === "5-1" || w.id === "5-2" || w.id === "5-3" || w.id === "5-4"
      ));
    });

    it("works when all workspaces assigned at least once", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "5-1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "1");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "4");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "3");
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, "2");

      // NOTE 5-1 is excluded because it's currently being worked on!
      const result = await this.scheduler.getWorkspacesThatCouldBeNext(USER_ID_1);
      expect(result).to.have.deep.members(workspaces.filter(
        w => w.id == "5" || w.id === "5-2" || w.id === "5-3" || w.id === "5-4"
      ));
    });
  });

  describe("findNextWorkspace", function() {
    it("works in a straightforward case", async function() {
      await this.scheduler.findNextWorkspace(USER_ID_1);
      const result = await this.scheduler.getIdOfCurrentWorkspace(USER_ID_1);
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
