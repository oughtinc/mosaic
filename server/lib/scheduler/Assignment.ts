class Assignment {
  private startedAt;
  private userId;
  private workspaceId;

  public constructor(userId, workspaceId){
    this.startedAt = Date.now();
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  public getStartedAtTimestamp() {
    return this.startedAt;
  }

  public getWorkspaceId() {
    return this.workspaceId;
  }
}

export { Assignment };
