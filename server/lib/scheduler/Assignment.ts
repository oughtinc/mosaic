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
    endAtTimestamp,
    userId,
    workspace,
    isAlreadySavedToDb = false,
  }) {
    this.updateAssignment = updateAssignment;
    this.experimentId = experimentId;
    this.isOracle = isOracle;
    this.isTimed = isTimed;
    this.startAtTimestamp = startAtTimestamp;
    this.endAtTimestamp = endAtTimestamp;
    this.userId = userId;
    this.workspace = workspace;

    if (!isAlreadySavedToDb) {
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
  }

  public getStartedAtTimestamp() {
    return this.startAtTimestamp;
  }

  public hasEnded() {
    return !!this.endAtTimestamp && Date.now() - this.endAtTimestamp > 3 * 1000;
  }

  public getWorkspace() {
    return this.workspace;
  }

  public endAssignment() {
    this.endAtTimestamp = Date.now();
    this.updateAssignment(this.id, { endAtTimestamp: this.endAtTimestamp });
  }

  public getHowLongDidAssignmentLast() {
    if (this.endAtTimestamp) {
      return this.endAtTimestamp - this.startAtTimestamp;
    }

    return 0;
  }
}

export { Assignment };
