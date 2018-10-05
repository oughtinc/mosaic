import * as chai from "chai";
const { expect } = chai;
import { Assignment } from "../../../lib/scheduler/Assignment";

const userId = "user1";
const workspaceId = "workspace1";

describe("Assignment class", () => {
  let assignment;
  beforeEach(() => {
    assignment = new Assignment({ userId, workspaceId });
  });

  it("has tests that work", () => {
    expect(true).to.equal(true);
  });

  it("can retrieve workspace id", () => {
    expect(assignment.getWorkspaceId()).to.equal("workspace1");
  });

  it("records initial timestamp", () => {
    expect(assignment.getStartedAtTimestamp()).to.be.a("number");
    const curTimestamp = Date.now();
    expect(curTimestamp - assignment.getStartedAtTimestamp() > 1000);
  });

  it("records correct timestamp", () => {
    const curTimestamp = Date.now();
    expect(curTimestamp - assignment.getStartedAtTimestamp() < 1000).to.equal(true);
  });
});
