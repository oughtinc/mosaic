class Assignment {
  private endAtTimestamp;
  private experimentId;
  private id;
  private startAtTimestamp;
  private userId;
  private updateAssignment;
  private workspace;

  public isOracle;
  public isTimed;

  public constructor({
    createAssignment,
    updateAssignment,
    experimentId,
    isOracle,
    isTimed,
    startAtTimestamp = Date.now(),
    userId,
    workspace
  }){
    this.updateAssignment = updateAssignment;
    this.experimentId = experimentId;
    this.isOracle = isOracle;
    this.isTimed = isTimed;
    this.startAtTimestamp = startAtTimestamp;
    this.userId = userId;
    this.workspace = workspace;

    this.id = createAssignment({
      experimentId,
      workspaceId: workspace.id,
      userId,
      startAtTimestamp,
      endAtTimestamp: null,
      isOracle,
      isTimed,
    });
  }

  public getStartedAtTimestamp() {
    return this.startAtTimestamp;
  }

  public hasEnded() {
    return !!this.endAtTimestamp;
  }

  public getWorkspace() {
    return this.workspace;
  }

  public endAssignment() {
    this.endAtTimestamp = Date.now();
    this.updateAssignment(this.id, { endAtTimestamp: this.endAtTimestamp });
  }

  public getHowLongDidAssignmentLast() {
    return this.endAtTimestamp - this.startAtTimestamp;
  }
}

export { Assignment };
