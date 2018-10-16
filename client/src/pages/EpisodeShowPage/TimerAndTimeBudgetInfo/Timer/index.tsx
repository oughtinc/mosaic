import * as moment from "moment";
import * as React from "react";
import { Glyphicon } from "react-bootstrap";

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
        <div style={this.props.style}>
          <span
            style={{
              color: timerHeaderFontColor,
              fontSize: timerHeaderFontSize,
              fontVariant: "small-caps",
              fontWeight: 700,
            }}
          >
            <Glyphicon glyph="time" /> time left
          </span>
            <br />
          <span
            style={{
              fontSize: "28px",
            }}
          >
            {moment(this.props.remainingDurationInMs).format("m")}
          </span>
          m
          {" "}
          <span
            style={{
              fontSize: "28px",
            }}
          >
            {moment(this.props.remainingDurationInMs).format("ss")}
          </span>
          s
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
