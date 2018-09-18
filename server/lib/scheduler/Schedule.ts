export class Schedule {
  public schedule = [];

  public addAssignment({ startedAt, workspaceId }) {
    this.schedule.push({ startedAt, workspaceId });
  }

  public getMostRecentAssignment() {
    return this.schedule.slice(-1)[0];
  }
}
