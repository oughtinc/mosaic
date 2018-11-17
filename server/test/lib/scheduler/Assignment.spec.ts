import * as chai from "chai";
const { expect } = chai;
import { Assignment } from "../../../lib/scheduler/Assignment";

import { USER_ID, workspaces } from "./utils";

describe("Assignment class", function() {
  beforeEach(function() {
    this.startedAtTimestamp = Date.now();

    this.assignment = new Assignment({
      userId: USER_ID,
      workspace: workspaces.get("1"),
      startedAtTimestamp: this.startedAtTimestamp,
    });
  });

  it("can retrieve workspace", function() {
    expect(this.assignment.getWorkspace()).to.equal(workspaces.get("1"));
  });

  it("records the timestamp at which the assignment started", function() {
    expect(this.assignment.getStartedAtTimestamp()).to.equal(this.startedAtTimestamp);
  });
});
