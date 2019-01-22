class DistanceFromWorkedOnWorkspaceCache {
  private cache = new Map();
  private userSchedule;
  private workspacesInTree;

  public constructor({ userSchedule, workspacesInTree }) {
    this.userSchedule = userSchedule;
    this.workspacesInTree = workspacesInTree;
  }

  public getDistFromWorkedOnWorkspace(workspace): number {
    const workspaceAlreadyCached: boolean = this.cache.has(workspace.id);

    if (workspaceAlreadyCached) {
      return this.cache.get(workspace.id);
    }

    const distFromWorkedOnWorkspace: number = this.calculateDistFromWorkedOnWorkspace(workspace);

    this.cache.set(workspace.id, distFromWorkedOnWorkspace);

    return distFromWorkedOnWorkspace;
  }

  private calculateDistFromWorkedOnWorkspace(workspace): number {
    let distance = 0;
    let howManyNodesAreInQueueDistanceAway = 1;
    let howManyNodesAreInQueueDistancePlusOneAway = 0;
    
    const queue: any = [workspace];

    // we keep track of what we've added so we don't add an already added node to the queue
    const idsOfWorkspacesAlreadyAddedToQueue: any = [workspace.id];

    let curWorkspace;
    while (queue.length > 0) {
      curWorkspace = queue.pop();

      const hasUserWorkedOnWorkspace = this.userSchedule.hasUserWorkedOnWorkspace(curWorkspace);
      if (hasUserWorkedOnWorkspace) {
        return distance;
      }

      // decrement the number of workspaces in queue distance away
      howManyNodesAreInQueueDistanceAway--;  

      let howManyWorkspacesAddedToQueueThisTime = 0;

      // add parent
      if (curWorkspace.parentId) {
        const hasBeenAlreadyAdded = idsOfWorkspacesAlreadyAddedToQueue.find(id => id === curWorkspace.parentId);
        if (!hasBeenAlreadyAdded) {
          const parent = this.workspacesInTree.find(w => w.id === curWorkspace.parentId);
          queue.unshift(parent);
          idsOfWorkspacesAlreadyAddedToQueue.push(parent.id);
          howManyWorkspacesAddedToQueueThisTime++;
        }
      }

      // add children
      const children = this.workspacesInTree.filter(w => w.parentId && w.parentId === curWorkspace.id);
      if (children.length > 0) {
        children.forEach(child => {
          const hasBeenAlreadyAdded = idsOfWorkspacesAlreadyAddedToQueue.find(id => id === child.id);
          if (!hasBeenAlreadyAdded) {
            queue.unshift(child);
            idsOfWorkspacesAlreadyAddedToQueue.push(child.id);
            howManyWorkspacesAddedToQueueThisTime++;
          }
        });
      }

      // increment number of workspaces in queue distance+1 away
      howManyNodesAreInQueueDistancePlusOneAway += howManyWorkspacesAddedToQueueThisTime;
      
      const isLeavingLevel = howManyNodesAreInQueueDistanceAway === 0;

      // if we're leaving current level
      // increment distance
      // and modify node tracking
      if (isLeavingLevel) {
        distance++;
        howManyNodesAreInQueueDistanceAway = howManyNodesAreInQueueDistancePlusOneAway;
        howManyNodesAreInQueueDistancePlusOneAway = 0;
      }
    }

    // if no node in tree has been worked on, return Infinity as distance
    return Infinity;
  }
}

export { DistanceFromWorkedOnWorkspaceCache };