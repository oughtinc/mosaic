import * as React from "react";

import { convertMsToReadableDurationInfo } from "../../../lib/convertMsToReadableDurationInfo";

class ReadableDuration extends React.Component<any, any> {
  public render() {
    const {
      daysToDisplay,
      hoursToDisplay,
      minutesToDisplay,
      secondsToDisplay
    } = convertMsToReadableDurationInfo(this.props.durationInMs);

    if (this.props.durationInMs < 0) {
      return (
        <span>
          <span style={{ fontSize: "28px" }}>0</span>s
        </span>
      );
    }

    return (
      <div style={this.props.style}>
        {daysToDisplay && (
          <span>
            <span
              style={{
                fontSize: "28px"
              }}
            >
              {daysToDisplay}
            </span>
            d{" "}
          </span>
        )}
        {hoursToDisplay && (
          <span>
            <span
              style={{
                fontSize: "28px"
              }}
            >
              {hoursToDisplay}
            </span>
            h{" "}
          </span>
        )}
        {minutesToDisplay && (
          <span>
            <span
              style={{
                fontSize: "28px"
              }}
            >
              {minutesToDisplay}
            </span>
            m{" "}
          </span>
        )}
        {secondsToDisplay && (
          <span>
            <span
              style={{
                fontSize: "28px"
              }}
            >
              {secondsToDisplay}
            </span>
            s
          </span>
        )}
      </div>
    );
  }
}

export { ReadableDuration };
