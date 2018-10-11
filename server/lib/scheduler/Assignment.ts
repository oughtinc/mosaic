class Assignment {
  private startedAt;
  private userId;
  private workspace;

  public constructor({ userId, workspace, startAtTimestamp = Date.now() }){
    this.startAtTimestamp = startAtTimestamp;
    this.userId = userId;
    this.workspace = workspace;
  }

  public getStartedAtTimestamp() {
    return this.startAtTimestamp;
  }

  public getWorkspace() {
    return this.workspace;
  }
}

export { Assignment };
