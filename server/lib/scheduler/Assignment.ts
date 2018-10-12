class Assignment {
  private startAtTimestamp;
  private userId;
  private workspace;

  public constructor({ startAtTimestamp = Date.now(), userId, workspace }){
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
