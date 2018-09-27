import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import { Glyphicon } from "react-bootstrap";

const LOCAL_STORAGE_KEY = "mosaic-timer";

class TimerPresentational extends React.Component<any,  any> {
  public render() {
    const timerRunning = !(this.props.timeLeft === Infinity || this.props.timeLeft <= 0);

    return (
      timerRunning
      &&
      (
        <div style={this.props.style}>
          <span
            style={{
              color: "#337ab7",
              fontVariant: "small-caps",
              fontSize: "18px",
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
        </div>
      )
    );
  }
}

export class Timer extends React.Component<any,  any> {
  public state = {
    timeLeft: Infinity,
  };

  private pollingInterval;

  public componentDidMount() {
    const durationInMs = moment.duration(this.props.durationString).asMilliseconds();

    if (!this.hasTimerStarted()) {
      // please see https://momentjs.com/docs/#/durations/creating/ for more
      // on the different duration string formats moment.duration() accepts
      this.startTimer(durationInMs);
    } else if (this.props.shouldTimerReset) {
      this.resetTimer(durationInMs);
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
        style={this.props.style}
        timeLeft={this.state.timeLeft}
      />
    );
  }

  private hasTimerStarted() {
    const localStorageEntry = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (localStorageEntry === null) {
      return false;
    }

    const timerData = JSON.parse(localStorageEntry);
    const timerEndTime = timerData[this.props.workspaceId];
    const timerValueIsValid = _.isFinite(Number(timerEndTime));

    if (!timerValueIsValid) {
      return false;
    }

    return true;
  }

  private resetTimer(durationInMs: number) {
    // currently this.startTimer() overwrites any current timer data
    // effectively reseting the timer
    this.startTimer(durationInMs);
  }

  private startTimer(durationInMs: number) {
    const localStorageEntry = localStorage.getItem(LOCAL_STORAGE_KEY);
    const endTimeInMS = Date.now() + durationInMs;
    const newTimerData = this.createNewTimerData(localStorageEntry, endTimeInMS);
    const newTimerDataStringified = JSON.stringify(newTimerData);
    localStorage.setItem(LOCAL_STORAGE_KEY, newTimerDataStringified);
  }

  private createNewTimerData(localStorageEntry: string | null, endTimeInMS: number) {
    if (localStorageEntry === null) {
      return {
        [this.props.workspaceId]: endTimeInMS,
      };
    } else {
      const prevTimerData = JSON.parse(localStorageEntry);
      return {
        ...prevTimerData,
        [this.props.workspaceId]: endTimeInMS,
      };
    }
  }

  private setTimeLeft() {
    this.setState({
      timeLeft: this.getHowMuchTimeLeft(),
    });
  }

  private getHowMuchTimeLeft() {
    const curTimeInMs = Date.now();
    const localStorageEntry = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (localStorageEntry === null) {
      return Infinity;
    }

    const timerData = JSON.parse(localStorageEntry);
    const endTimeInMs = timerData[this.props.workspaceId];

    if (!endTimeInMs) {
      return Infinity;
    }

    const timeLeftInMs = endTimeInMs - curTimeInMs;
    return timeLeftInMs;
  }

  private hasTimerEnded() {
    return this.getHowMuchTimeLeft() <= 0;
  }
}
