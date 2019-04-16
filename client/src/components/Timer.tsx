import * as React from "react";

export class Timer extends React.Component<any, any> {
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
    return <span>{this.props.children}</span>;
  }
}
