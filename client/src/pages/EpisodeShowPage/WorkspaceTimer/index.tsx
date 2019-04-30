import * as React from "react";
import { Glyphicon } from "react-bootstrap";

import { ReadableDuration } from "../../../components/ReadableDuration";
import { Timer } from "../../../components/Timer";

import { timerHeaderFontColor, timerHeaderFontSize } from "../../../styles";

export class WorkspaceTimer extends React.Component<any, any> {
  public render() {
    const timerRunning =
      !!this.props.remainingDurationInMs &&
      !(this.props.remainingDurationInMs <= 0);

    return (
      timerRunning && (
        <Timer {...this.props}>
          <div style={{ ...this.props.style }}>
            <span
              style={{
                alignItems: "center",
                color: timerHeaderFontColor,
                display: "flex",
                fontSize: timerHeaderFontSize,
                fontVariant: "small-caps",
                fontWeight: 700,
                justifyItems: "space-between",
              }}
            >
              <Glyphicon
                glyph="time"
                style={{ fontSize: "24px", marginRight: "5px" }}
              />
              <span>this session</span>
            </span>

            <ReadableDuration
              durationInMs={this.props.remainingDurationInMs}
              shouldShowSeconds={true}
              style={{ textAlign: "center" }}
            />
          </div>
        </Timer>
      )
    );
  }
}
