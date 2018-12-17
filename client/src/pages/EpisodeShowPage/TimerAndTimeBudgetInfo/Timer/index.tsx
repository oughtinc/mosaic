import * as React from "react";
import { Glyphicon } from "react-bootstrap";

import { ReadableDuration } from "../ReadableDuration";

import {
  timerHeaderFontColor,
  timerHeaderFontSize,
} from "../../../../styles";

class TimerPresentational extends React.Component<any,  any> {
  public render() {
    const timerRunning = !!this.props.remainingDurationInMs && !(this.props.remainingDurationInMs <= 0);

    return (
      timerRunning
      &&
      (
        <div style={{...this.props.style}}>
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
            <Glyphicon glyph="time" style={{ fontSize: "24px", marginRight: "5px" }}/>
            <span>this session</span>
          </span>

          <ReadableDuration
            durationInMs={this.props.remainingDurationInMs}
            shouldShowSeconds={true}
            style={{ textAlign: "center" }}
          />
        </div>
      )
    );
  }
}

export class Timer extends React.Component<any,  any> {
  private tickInterval;

  public componentDidMount() {
    this.tickInterval = setInterval(() => {
      this.props.onTimerTick();
    }, this.props.tickDuration * 1000);
  }

  public componentWillUnmount() {
    clearInterval(this.tickInterval);
  }

  public render() {
    return (
      <TimerPresentational
        {...this.props}
      />
    );
  }
}
