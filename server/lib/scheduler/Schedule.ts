import { UserSchedule } from "./UserSchedule";

class Schedule {
  private rootParentFinder;
  private schedule = new Map;
  private timeLimit;

  public constructor({ rootParentFinder, timeLimit }) {
    this.rootParentFinder = rootParentFinder;
    this.timeLimit = timeLimit;
  }

  private doesUserHaveASchedule(userId) {
    return this.schedule.has(userId);
  }

  private createUserSchedule(userId) {
    this.schedule.set(userId, new UserSchedule(userId));
  }

  private getUserSchedule(userId) {
    return this.schedule.get(userId);
  }

  public assignWorkspaceToUser(userId, workspaceId) {
    if (!this.doesUserHaveASchedule(userId)) {
      this.createUserSchedule(userId);
    }

    const userSchedule = this.getUserSchedule(userId);
    userSchedule.assignWorkspace(workspaceId);
  }

  public getMostRecentAssignmentForUser(userId) {
    if (!this.doesUserHaveASchedule(userId)) {
      return undefined;
    }

    const userSchedule = this.getUserSchedule(userId);
    return userSchedule.getMostRecentAssignment();
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  public async isInTreeWorkedOnLeastRecently(workspaceIds, workspaceId) {
    const treesWorksOnLeastRecently = await this.getTreesWorkedOnLeastRecently(workspaceIds);
    const rootParentId = await this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId);
    return Boolean(treesWorksOnLeastRecently.find(wId => wId === rootParentId));
  }

  /*
    NOTE: this only considers the trees that at least one workspace in the
    workspaces argument belong to
  */
  public async getTreesWorkedOnLeastRecently(workspaceIds) {
    const data = {}; // maps rootWorkspaceIds to most recent timestamp

    // initialize at -1
    for (let i = 0; i < workspaceIds.length; i++) {
      const workspaceId = workspaceIds[i];
      const rootParentId = await this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId);
      data[rootParentId] = -1;
    }

    // go through all user schedule and update index
    for (const [userId, userSchedule] of this.schedule) {
      const userScheduleAsArrayOfAssignments = userSchedule.asAnArrayOfAssignments();
      for (const assignment of userScheduleAsArrayOfAssignments) {
        const workspaceId = await assignment.getWorkspaceId(); // WHAT IS GOING ON HERE, WHY NEED AWAIT???
        const rootParentId = await this.rootParentFinder.getRootParentIdOfWorkspace(workspaceId);
        data[rootParentId] = Math.max(data[rootParentId], assignment.getStartedAtTimestamp());
      }
    }

    // get smallest index
    let smallestIndex = Infinity;
    for (const workspaceId in data) {
      if (data.hasOwnProperty(workspaceId)) {
        smallestIndex = Math.min(smallestIndex, data[workspaceId]);
      }
    }
    // collect rootWorkspaceIds with this index
    const leastRecentlyWorkedOnTrees = [];
    for (const workspaceId in data) {
      if (data.hasOwnProperty(workspaceId)) {
        if (data[workspaceId] === smallestIndex)
        leastRecentlyWorkedOnTrees.push(workspaceId);
      }
    }
    return leastRecentlyWorkedOnTrees;
  }

  public isWorkspaceCurrentlyBeingWorkedOn(workspaceId) {
    for (const [userId, userSchedule] of this.schedule) {
      if (!userSchedule.hasUserBeenAssignedToAnyWorkspaces()) {
        continue;
      }

      const lastWorkedOnAssignment = userSchedule.getMostRecentAssignment();
      const didUserLastWorkOnWorkspace = lastWorkedOnAssignment.getWorkspaceId() === workspaceId;
      if (!didUserLastWorkOnWorkspace) {
        continue;
      }

      const howLongAgoUserStartedWorkingOnIt = Date.now() - lastWorkedOnAssignment.getStartedAtTimestamp();
      const didUserStartWorkingOnItWithinTimeLimit = howLongAgoUserStartedWorkingOnIt < this.timeLimit;
      if (didUserStartWorkingOnItWithinTimeLimit) {
        return true;
      }
    }

    return false;
  }

  public hasWorkspaceBeenWorkedOnYet(workspaceId) {
    for (const [userId, userSchedule] of this.schedule) {
      if (userSchedule.hasUserWorkedOnWorkspace(workspaceId)) {
        return true;
      }
    }

    return false;
  }

  public getTimestampWorkspaceLastWorkedOn(workspaceId) {
    let lastWorkedOnTimestamp = -Infinity;

    for (const [userId, userSchedule] of this.schedule) {
      for (const assignment of userSchedule.userSchedule) {
        if (assignment.workspaceId === workspaceId) {
          const startedAtTimestamp = assignment.getStartedAtTimestamp();
          if (startedAtTimestamp > lastWorkedOnTimestamp) {
            lastWorkedOnTimestamp = startedAtTimestamp;
          }
        }
      }
    }

    return lastWorkedOnTimestamp;
  }

  public getWhichOfTheseWorkspacesWorkedOnLeastRecently(workspaceIds) {
    let idOfworkspaceWorkedOnLeastRecently;
    let whenThisWorkspaceWasWorkedOn;

    workspaceIds.forEach(workspaceId => {
      const lastWorkedOnTimestamp = this.getTimestampWorkspaceLastWorkedOn(workspaceId);
      if (!idOfworkspaceWorkedOnLeastRecently || lastWorkedOnTimestamp < whenThisWorkspaceWasWorkedOn) {
        idOfworkspaceWorkedOnLeastRecently = workspaceId;
        whenThisWorkspaceWasWorkedOn = lastWorkedOnTimestamp;
      }
    });

    return idOfworkspaceWorkedOnLeastRecently;
  }

}

export { Schedule };
