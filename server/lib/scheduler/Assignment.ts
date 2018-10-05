class Assignment {
  private startedAt;
  private userId;
  private workspaceId;

  public constructor({ userId, workspaceId, startAtTimestamp = Date.now() }){
    this.startAtTimestamp = startAtTimestamp;
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  public getStartedAtTimestamp() {
    return this.startAtTimestamp;
  }

  public getWorkspaceId() {
    return this.workspaceId;
  }
}

export { Assignment };
