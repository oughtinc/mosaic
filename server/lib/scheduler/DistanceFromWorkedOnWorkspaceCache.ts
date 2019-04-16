class DistanceFromWorkedOnWorkspaceCache {
  private cache = new Map();
  private weKnowDistanceIsInfinity = false;
  private userSchedule;
  private workspacesInTree;

  public constructor({ userSchedule, workspacesInTree }) {
    this.userSchedule = userSchedule;
    this.workspacesInTree = workspacesInTree;
  }

  public getDistanceFromWorkedOnWorkspace(workspace): number {
    if (this.weKnowDistanceIsInfinity) {
      return Infinity;
    }

    const workspaceAlreadyCached: boolean = this.cache.has(workspace.id);
    if (workspaceAlreadyCached) {
      return this.cache.get(workspace.id);
    }

    const distanceFromWorkedOnWorkspace: number = this.calculateDistanceFromWorkedOnWorkspace(
      workspace,
    );

    if (distanceFromWorkedOnWorkspace === Infinity) {
      this.weKnowDistanceIsInfinity = true;
    }

    this.cache.set(workspace.id, distanceFromWorkedOnWorkspace);

    return distanceFromWorkedOnWorkspace;
  }

  private calculateDistanceFromWorkedOnWorkspace(workspace): number {
    let curDistance = 0;
    let howManyNodesAreInQueueCurDistanceAway = 1;
    let howManyNodesAreInQueueCurDistancePlusOneAway = 0;

    let upperBoundForDistanceAwayFromWorkedOnWorkspace = Infinity;

    // we're using a queue to implemenet BFS
    const queue: any = [workspace];

    // we keep track of what we've added so we don't add an already added node to the queue
    const idsOfWorkspacesAlreadyAddedToQueue: any = [workspace.id];

    while (queue.length > 0) {
      const curWorkspace = queue.pop();

      const hasUserWorkedOnWorkspace = this.userSchedule.hasUserWorkedOnWorkspace(
        curWorkspace,
      );
      if (hasUserWorkedOnWorkspace) {
        return curDistance;
      }

      const workspaceAlreadyCached: boolean = this.cache.has(curWorkspace.id);
      if (workspaceAlreadyCached) {
        upperBoundForDistanceAwayFromWorkedOnWorkspace = Math.min(
          upperBoundForDistanceAwayFromWorkedOnWorkspace,
          this.cache.get(curWorkspace.id) + curDistance,
        );
      }

      // decrement the number of workspaces in queue distance away
      howManyNodesAreInQueueCurDistanceAway--;

      let howManyWorkspacesAddedToQueueThisTime = 0;

      // add parent (if there is one) to queue
      if (curWorkspace.parentId) {
        const hasBeenAlreadyAdded = idsOfWorkspacesAlreadyAddedToQueue.find(
          id => id === curWorkspace.parentId,
        );
        if (!hasBeenAlreadyAdded) {
          const parent = this.workspacesInTree.find(
            w => w.id === curWorkspace.parentId,
          );
          queue.unshift(parent);
          idsOfWorkspacesAlreadyAddedToQueue.push(parent.id);
          howManyWorkspacesAddedToQueueThisTime++;
        }
      }

      // add children (if there are any) to queue
      const children = this.workspacesInTree.filter(
        w => w.parentId && w.parentId === curWorkspace.id,
      );
      if (children.length > 0) {
        children.forEach(child => {
          const hasBeenAlreadyAdded = idsOfWorkspacesAlreadyAddedToQueue.find(
            id => id === child.id,
          );
          if (!hasBeenAlreadyAdded) {
            queue.unshift(child);
            idsOfWorkspacesAlreadyAddedToQueue.push(child.id);
            howManyWorkspacesAddedToQueueThisTime++;
          }
        });
      }

      // increment number of workspaces in queue distance+1 away
      howManyNodesAreInQueueCurDistancePlusOneAway += howManyWorkspacesAddedToQueueThisTime;

      const isLeavingLevel = howManyNodesAreInQueueCurDistanceAway === 0;

      // if we're leaving current level
      // increment distance
      // and modify node tracking
      if (isLeavingLevel) {
        curDistance++;
        // if we ever hit upper bound, can stop there
        if (upperBoundForDistanceAwayFromWorkedOnWorkspace === curDistance) {
          return upperBoundForDistanceAwayFromWorkedOnWorkspace;
        }
        howManyNodesAreInQueueCurDistanceAway = howManyNodesAreInQueueCurDistancePlusOneAway;
        howManyNodesAreInQueueCurDistancePlusOneAway = 0;
      }
    }

    // if no node in tree has been worked on, return Infinity as distance
    return Infinity;
  }
}

export { DistanceFromWorkedOnWorkspaceCache };
