import * as _ from "lodash";
import { Assignment } from "./Assignment";
import { RootParentFinder } from "./RootParentFinder";

class UserSchedule {
  private lastWorkedOnTimestampForTree = {};
  private rootParentCache;
  private timeLimit;
  private userId;
  private userSchedule = [];

  public constructor({ rootParentCache, timeLimit, userId }) {
    this.rootParentCache = rootParentCache;
    this.timeLimit = timeLimit;
    this.userId = userId;
  }
  
  public async assignWorkspace(workspace, startAtTimestamp = Date.now()) {
    const assignment = new Assignment({
      userId: this.userId,
      workspace,
      startAtTimestamp,
    });
    console.log()
    console.log(`ASSIGNING ${workspace.id}`)
    this.userSchedule.push(assignment);

    const rootParent = await this.rootParentCache.getRootParentOfWorkspace(workspace);
    console.log()
    console.log(`THIS HAS ROOT PARENT ${rootParent.id}`)

    this.lastWorkedOnTimestampForTree[rootParent.id] = startAtTimestamp;
    console.log()
    console.log(`CACHE NOW LOOKS LIKE ${JSON.stringify(this.lastWorkedOnTimestampForTree)}`)
    console.log()
  }

  public getMostRecentAssignment() {
    return this.userSchedule[this.userSchedule.length - 1];
  }

  public getTreesWorkedOnLeastRecentlyByUser(rootWorkspaces) {
    console.log("in user schedule")
    const treesNotYetWorkedOn = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === undefined
    );

    console.log("treesNotYetWorkedOn", treesNotYetWorkedOn.length, treesNotYetWorkedOn.map(w => w.id))

    console.log("this.lastWorkedOnTimestampForTree", this.lastWorkedOnTimestampForTree)

    if (treesNotYetWorkedOn.length > 0) {
      return treesNotYetWorkedOn;
    }

    const lastWorkedOnTimestamps = rootWorkspaces.map(
      r => this.lastWorkedOnTimestampForTree[r.id]
    );

    const minTimestamp = Math.min.apply(Math, lastWorkedOnTimestamps);

    const leastRecentlyWorkedOnTrees = rootWorkspaces.filter(
      r => this.lastWorkedOnTimestampForTree[r.id] === minTimestamp
    );

    console.log("leaving schedule")
    return leastRecentlyWorkedOnTrees;
  }

  public hasUserWorkedOnWorkspace(workspace) {
    return _.some(this.userSchedule, assignment => assignment.getWorkspace().id === workspace.id);
  }

  public isUserCurrentlyWorkingOnWorkspace(workspace) {
    const lastWorkedOnWorkspace = this.lastWorkedOnWorkspace();

    if (!lastWorkedOnWorkspace) {
      return false;
    }

    return (
      this.lastWorkedOnWorkspace().id === workspace.id
      &&
      this.isActiveInLastWorkspace()
    );
  }

  private lastWorkedOnWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();

    if (lastWorkedOnAssignment) {
      return lastWorkedOnAssignment.getWorkspace();
    }

    return undefined;
  }

  private isActiveInLastWorkspace() {
    const lastWorkedOnAssignment = this.getMostRecentAssignment();
    const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();
    const didUserStartWorkingOnItWithinTimeLimit = howLongAgoUserStartedWorkingOnIt < this.timeLimit;

    if (didUserStartWorkingOnItWithinTimeLimit) {
      return true;
    }

    return false;
  }
}

export { UserSchedule };
