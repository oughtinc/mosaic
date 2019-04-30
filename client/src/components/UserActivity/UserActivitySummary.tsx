import * as React from "react";
import { ReadableDuration } from "../ReadableDuration";

export class UserActivitySummary extends React.Component<any, any> {
  public render() {
    const {
      averageTimeInMsSpentOnEachWorkspace,
      howManyPrimaryWorkspacesHasUserWorkedOn,
      howManyFallbackWorkspacesHasUserWorkedOn,
    } = this.props;

    const howManyWorkspacesVisited =
      Number(howManyPrimaryWorkspacesHasUserWorkedOn) +
      Number(howManyFallbackWorkspacesHasUserWorkedOn);

    return (
      <div
        style={{
          paddingBottom: "15px",
          paddingLeft: "120px",
        }}
      >
        <span style={{ color: "#11aa11", fontSize: "24px" }}>
          {howManyWorkspacesVisited}
        </span>{" "}
        workspace{howManyPrimaryWorkspacesHasUserWorkedOn !== 1 ? "s" : ""}{" "}
        visited
        <br />
        <ReadableDuration
          durationInMs={averageTimeInMsSpentOnEachWorkspace}
          numberFontSize="24px"
          style={{
            color: "#11aa11",
            fontSize: "16px",
          }}
        />{" "}
        average time spent on each workspace
      </div>
    );
  }
}
