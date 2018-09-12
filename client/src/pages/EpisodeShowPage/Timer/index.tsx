import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import { Glyphicon } from "react-bootstrap";

class TimerPresentational extends React.Component<any,  any> {
  public render() {
    const timerRunning = !(this.props.timeLeft === Infinity || this.props.timeLeft <= 0);

    return (
      <span
        style={{
          display: timerRunning ? "inline" : "none"
        }}
      >
        <span
          style={{
            color: "#137a9a",
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
          {moment(this.props.timeLeft).format("m")}
        </span>
        m
        {" "}
        <span
          style={{
            fontSize: "28px",
          }}
        >
          {moment(this.props.timeLeft).format("ss")}
        </span>
        s
      </span>
    );
  }
}

export class Timer extends React.Component<any,  any> {
  public state = {
    timeLeft: Infinity,
  };

  private localStorageKey;
  private pollingInterval;

  public constructor(props: any) {
    super(props);
    this.localStorageKey = `mosiac-timer-${props.workspaceId}`;
  }

  public componentDidMount() {
    if (!this.hasTimerStarted()) {
      // please see https://momentjs.com/docs/#/durations/creating/ for more
      // on the different duration string formats moment.duration() accepts
      const durationInMs = moment.duration(this.props.durationString).asMilliseconds();
      this.startTimer(durationInMs);
    }

    this.pollingInterval = setInterval(() => {
      this.setTimeLeft();
      if (this.hasTimerEnded()) {
        this.props.onTimerEnd();
        clearInterval(this.pollingInterval);
      }
    }, 250);
  }

  public componentWillUnmount() {
    clearInterval(this.pollingInterval);
  }

  public render() {
    return (
      <TimerPresentational
        timeLeft={this.state.timeLeft}
      />
    );
  }

  private hasTimerStarted() {
    const timerEndTime = localStorage.getItem(this.localStorageKey);

    const timerHasNotBeenSet = timerEndTime === null;

    if (timerHasNotBeenSet) {
      return false;
    }

    const timerValueIsValid = _.isFinite(Number(timerEndTime));

    if (!timerValueIsValid) {
      return false;
    }

    return true;
  }

  private startTimer(durationInMs: number) {
    const endTimeInMS = Date.now() + durationInMs;
    localStorage.setItem(this.localStorageKey, String(endTimeInMS));
  }

  private setTimeLeft() {
    this.setState({
      timeLeft: this.getHowMuchTimeLeft(),
    });
  }

  private getHowMuchTimeLeft() {
    const curTimeInMs = Date.now();
    const endTimeInMs = Number(localStorage.getItem(this.localStorageKey));
    const timeLeftInMs = endTimeInMs - curTimeInMs;
    return timeLeftInMs;
  }

  private hasTimerEnded() {
    return this.getHowMuchTimeLeft() <= 0;
  }
}
