import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { Schedule } from "../../../lib/scheduler/Schedule";
import { Scheduler } from "../../../lib/scheduler/Scheduler";

import {
  USER_ID,
  USER_ID_1,
  USER_ID_2,
  workspaces,
  rootParentCacheFake
} from "./utils";

const ONE_MINUTE = 60 * 1000;

const fetchAllRootWorkspacesFake = () => workspaces.filter(w => w.id.length === 1);

const fetchAllWorkspacesInTreeFake = rootWorkspace => workspaces.filter(
  w => w.id[0] === rootWorkspace.id
);

describe("Scheduler class", function() {
  const resetBeforeTesting = function() {
    this.clock = sinon.useFakeTimers();
    this.schedule = new Schedule({
      rootParentCache: rootParentCacheFake,
      timeLimit: ONE_MINUTE,
    });

    this.scheduler = new Scheduler({
      fetchAllRootWorkspaces: fetchAllRootWorkspacesFake,
      fetchAllWorkspacesInTree: fetchAllWorkspacesInTreeFake,
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
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w !== workspaces.get("1-1")));
    });

    it("doesn't exclude a workspace that was worked on but time limit has passed", async function() {
      this.schedule .assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE + 100);

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces);
    });

    it("doesn't exclude a workspace that was worked on but user has started different workspace", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE / 2);

      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));

      const result = await this.scheduler.filterByEligibility(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w !== workspaces.get("2")));
    });
  });

  describe("filterByWhetherInTreeWorkedOnLeastRecently", function() {
    it("works in straightforward case", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w !== workspaces.get("1") && w !== workspaces.get("1-1") && w !== workspaces.get("1-1-1")
      )));
    });

    it("works in more complicated case", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w !== workspaces.get("1") && w !== workspaces.get("1-1") && w !== workspaces.get("1-1-1")
        &&
        w !== workspaces.get("2") && w !== workspaces.get("2-1") && w !== workspaces.get("2-2")
      )));
    });

    it("works when only one tree hasn't been worked on", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("4"));

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => w === workspaces.get("3")));
    });

    it("works when every tree has been worked on", async function() {
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("4"));
      this.clock.tick(100);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("3"));

      const result = await this.scheduler.filterByWhetherInTreeWorkedOnLeastRecently(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w === workspaces.get("2") || w === workspaces.get("2-1") || w === workspaces.get("2-2")
      )));
    });

  });

  describe("filterByWhetherNotYetWorkedOn", function() {
    it("works in straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE / 2);
      this.schedule.assignWorkspaceToUser(USER_ID_2, workspaces.get("2"));

      const result = await this.scheduler.filterByWhetherNotYetWorkedOn(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w !== workspaces.get("1-1") && w !== workspaces.get("2")
      )));
    });
  });

  describe("filterByWhetherHasRemainingBudget", function() {
    it("works in straightforward case", function() {
      const result = this.scheduler.filterByWhetherHasRemainingBudget(workspaces);
      expect(result).to.have.deep.members(workspaces.filter(w => (
        w !== workspaces.get("1") && w !== workspaces.get("1-1") && w !== workspaces.get("1-1-1")
        && w !== workspaces.get("5-4")
      )));
    });
  });

  describe("getActionableWorkspaces", function() {
    it("works in a straightforward case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE / 2);
      this.schedule.assignWorkspaceToUser(USER_ID_2, workspaces.get("2"));

      const result = await this.scheduler.getActionableWorkspaces();
      expect(result).to.have.deep.members(workspaces.filter(w =>
        w === workspaces.get("3")
        ||
        w === workspaces.get("4")
        ||
        w == workspaces.get("5") || w === workspaces.get("5-1") || w === workspaces.get("5-2") || w === workspaces.get("5-3") || w === workspaces.get("5-4")
      ));
    });

    it("works when all trees assigned at least once", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("4"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("3"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));


      const result = await this.scheduler.getActionableWorkspaces(USER_ID_1);
      expect(result.length).to.equal(4);
      // 5-1 excluded because it's already been assigned but others haven't
      expect(result).to.have.deep.members(workspaces.filter(
        w => w == workspaces.get("5") || w === workspaces.get("5-2") || w === workspaces.get("5-3") || w === workspaces.get("5-4")
      ));
    });

    it("works when all workspaces assigned at least once", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-3"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-4"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("4"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("3"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-2"));

      const result = await this.scheduler.getActionableWorkspaces(USER_ID_1);
      expect(result.length).to.equal(4);
      // 5-4 excluded because it has no remaining budget
      expect(result).to.have.deep.members(workspaces.filter(
        w => w == workspaces.get("5") || w === workspaces.get("5-1") || w === workspaces.get("5-2") || w === workspaces.get("5-3")
      ));
    });

    it("works when all workspaces assigned at least once and no remaining budget among least recent tree", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-3"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1-1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-4"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("4"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("3"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("2-2"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID, workspaces.get("5"));

      const result = await this.scheduler.getActionableWorkspaces(USER_ID_1);
      expect(result.length).to.equal(1);
      // 5-4 excluded because it has no remaining budget
      expect(result).to.have.deep.members(workspaces.filter(
        w => w == workspaces.get("1-1")
      ));
    });
  });

  describe("assignNextWorkspace", function() {
    it("works in a straightforward case", async function() {
      await this.scheduler.assignNextWorkspace(USER_ID_1);
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

    it("works in a complicated case", async function() {
      this.schedule.assignWorkspaceToUser(USER_ID_1, workspaces.get("1-1"));
      this.clock.tick(ONE_MINUTE);
      this.schedule.assignWorkspaceToUser(USER_ID_2, workspaces.get("2"));
      this.clock.tick(ONE_MINUTE);

      await this.scheduler.assignNextWorkspace(USER_ID);
      const result = await this.scheduler.getIdOfCurrentWorkspace(USER_ID);
      expect(result).to.be.oneOf([
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
