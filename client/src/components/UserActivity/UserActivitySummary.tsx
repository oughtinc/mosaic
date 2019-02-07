import * as React from "react";
import { ReadableDuration } from "../ReadableDuration";

export class UserActivitySummary extends React.Component<any, any> {
  public render() {
    const {
        averageTimeInMsSpentOnEachWorkspace,
        howManyPrimaryWorkspacesHasUserWorkedOn,
        howManyFallbackWorkspacesHasUserWorkedOn,
    } = this.props;

    return (
      <div
        style={{
          paddingBottom: "15px",
          paddingLeft: "120px"
        }}
      >
        <span
          style={{ color: "#11aa11", fontSize: "24px" }}
        >
          {howManyPrimaryWorkspacesHasUserWorkedOn}
        </span>
        {" "}primary workspace{howManyPrimaryWorkspacesHasUserWorkedOn !== 1 ? "s" : ""} visited
        <br />
        <span
          style={{ color: "#058", fontSize: "24px" }}
        >
          {howManyFallbackWorkspacesHasUserWorkedOn}
        </span>
        {" "}fallback workspace{howManyFallbackWorkspacesHasUserWorkedOn !== 1 ? "s" : ""} visited
        <br />
        <ReadableDuration
          durationInMs={averageTimeInMsSpentOnEachWorkspace}
          numberFontSize="24px"
          style={{
            color: "#11aa11",
            fontSize: "16px"
          }}
        />
        {" "}average time spent on each workspace
      </div>
    );
  }
}
