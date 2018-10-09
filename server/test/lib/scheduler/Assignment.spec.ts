import * as chai from "chai";
const { expect } = chai;
import { Assignment } from "../../../lib/scheduler/Assignment";

import { USER_ID, WORKSPACE_ID } from "./utils";

describe("Assignment class", function() {
  beforeEach(function() {
    this.startedAtTimestamp = Date.now();

    this.assignment = new Assignment({
      userId: USER_ID,
      workspaceId: WORKSPACE_ID,
      startedAtTimestamp: this.startedAtTimestamp,
    });
  });

  it("can retrieve workspace id", function() {
    expect(this.assignment.getWorkspaceId()).to.equal(WORKSPACE_ID);
  });

  it("records the timestamp at which the assignment started", function() {
    expect(this.assignment.getStartedAtTimestamp()).to.equal(this.startedAtTimestamp);
  });
});
