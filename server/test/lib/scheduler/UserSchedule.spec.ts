import * as chai from "chai";
const { expect } = chai;
import * as sinon from "sinon";

import { UserSchedule } from "../../../lib/scheduler/UserSchedule";

import {
  USER_ID,
  rootParentCacheFake,
  timeLimit,
  workspaces,
} from "./utils";

const ONE_MINUTE = 60 * 1000;

describe("UserSchedule class", function() {
  before(function() {
    this.userSchedule = new UserSchedule({
      userId: USER_ID,
      rootParentCache: rootParentCacheFake,
      timeLimit,
    });
  });

  beforeEach(function() {
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    this.userSchedule = new UserSchedule({
      userId: USER_ID,
      rootParentCache: rootParentCacheFake,
      timeLimit,
    });
  });

  after(function(){
    this.clock.restore();
  });

  describe("getMostRecentAssignment method", function() {
    context("with a user that has not been assigned to a workspace", function() {
      it("returns undefined", function() {
        expect(this.userSchedule.getMostRecentAssignment()).to.equal(undefined);
      });
    });

    context("with a user that has been assigned to a workspace once", function() {
      it("returns that workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        const mostRecentAssignment = this.userSchedule.getMostRecentAssignment();
        expect(mostRecentAssignment.getWorkspace()).to.equal(workspaces.get("1"));
      });
    });

    context("with a user that has been assigned to two workspaces", function() {
      it("returns the most recently assigned workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        const mostRecentAssignment = this.userSchedule.getMostRecentAssignment()
        expect(mostRecentAssignment.getWorkspace()).to.equal(workspaces.get("2"));
      });
    });
  });

  describe("getTreesWorkedOnLeastRecentlyByUser method", function() {
    const rootWorkspaces = [
      workspaces.get("1"),
      workspaces.get("2"),
      workspaces.get("3"),
      workspaces.get("4"),
      workspaces.get("5"),
    ];

    context("with a user that has not been assigned to workspace", function() {
      it("returns all trees", function() {
        const trees = this.userSchedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces);
        expect(trees).to.have.deep.members(rootWorkspaces);
      });
    });

    context("with a user that has been assigned to some trees", function() {
      it("returns correct trees", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        const trees = this.userSchedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces);
        expect(trees).to.have.deep.members(rootWorkspaces.filter(w => w.id !== "2"));
      });
    });

    context("with a user that has been assigned to all trees", function() {
      it("returns correct tree", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        this.clock.tick(ONE_MINUTE);
        await this.userSchedule.assignWorkspace(workspaces.get("2-1"));
        this.clock.tick(ONE_MINUTE);
        await this.userSchedule.assignWorkspace(workspaces.get("3"));
        this.clock.tick(ONE_MINUTE);
        await this.userSchedule.assignWorkspace(workspaces.get("1-1-1"));
        this.clock.tick(ONE_MINUTE);
        await this.userSchedule.assignWorkspace(workspaces.get("5-2"));
        this.clock.tick(ONE_MINUTE);
        await this.userSchedule.assignWorkspace(workspaces.get("4"));
        const trees = this.userSchedule.getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces);
        expect(trees).to.have.deep.members(rootWorkspaces.filter(w => w.id === "2"));
      });
    });
  });

  describe("hasUserWorkedOnWorkspace method", function() {
    context("with a user that has not been assigned to any workspace", function() {
      it("returns false", function() {
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("1"))).to.equal(false);
      });
    });

    context("with a user that has been assigned to a workspace once", function() {
      it("returns true for assigned workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("1"))).to.equal(true);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("2"))).to.equal(false);
      });

      it("returns false for other workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("2-1"))).to.equal(false);
      });
    });

    context("with a user that has been assigned to two workspaces", function() {
      it("returns true for both", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        await this.userSchedule.assignWorkspace(workspaces.get("2-1"));
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("2"))).to.equal(true);
        expect(this.userSchedule.hasUserWorkedOnWorkspace(workspaces.get("2-1"))).to.equal(true);
      });
    });
  });

  describe("isUserCurrentlyWorkingOnWorkspace method", function() {
    context("with a user that has not been assigned to any workspace", function() {
      it("returns false", function() {
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("1"))).to.equal(false);
      });
    });

    context("with a user that has been assigned to one workspace", function() {
      it("returns true for assigned workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("1"))).to.equal(true);
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("1-1"))).to.equal(false);
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("2"))).to.equal(false);
      });
    });

    context("with a user that has been assigned to two workspaces", function() {
      it("returns true for most recent, false for less recent", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        await this.userSchedule.assignWorkspace(workspaces.get("2-1"));
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("2"))).to.equal(false);
        expect(this.userSchedule.isUserCurrentlyWorkingOnWorkspace(workspaces.get("2-1"))).to.equal(true);
      });
    });
  });

  describe("getLastWorkedOnWorkspace method", function() {
    context("with a user that has not been assigned to workspace", function() {
      it("returns undefined", function() {
        expect(this.userSchedule.getLastWorkedOnWorkspace()).to.equal(undefined);
      });
    });

    context("with a user that has been assigned to a workspace once", function() {
      it("returns that workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        expect(this.userSchedule.getLastWorkedOnWorkspace()).to.equal(workspaces.get("1"));
      });
    });

    context("with a user that has been assigned to two workspaces", function() {
      it("returns the most recently assigned workspace", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        await this.userSchedule.assignWorkspace(workspaces.get("2"));
        expect(this.userSchedule.getLastWorkedOnWorkspace()).to.equal(workspaces.get("2"));
      });
    });
  });

  describe("isActiveInLastWorkspace method", function() {
    context("with a user that has not been assigned to workspace", function() {
      it("returns undefined", function() {
        expect(this.userSchedule.getLastWorkedOnWorkspace()).to.equal(undefined);
      });
    });

    context("with a user that has been assigned a workspace and no time has passed", function() {
      it("returns true", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        expect(this.userSchedule.isActiveInLastWorkspace()).to.equal(true);
      });
    });

    context("with a user that has been assigned a workspace and a little time has passed", function() {
      it("returns true", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        this.clock.tick(ONE_MINUTE / 10);
        expect(this.userSchedule.isActiveInLastWorkspace()).to.equal(true);
      });
    });

    context("with a user that has been assigned a workspace and a lot of time has passed", function() {
      it("returns false", async function() {
        await this.userSchedule.assignWorkspace(workspaces.get("1"));
        this.clock.tick(ONE_MINUTE * 10);
        expect(this.userSchedule.isActiveInLastWorkspace()).to.equal(false);
      });
    });
  });
});
