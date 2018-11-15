import { Duration } from "luxon";
import * as React from "react";
import { Badge } from "react-bootstrap";

function secondsToDurationString(seconds: number, shouldShowSeconds: boolean) {
  const milliseconds = seconds * 1000;
  const durationInMs = Duration.fromMillis(milliseconds);
  const duration = durationInMs.shiftTo("days", "hours", "minutes", "seconds");

  let durationString = "";

  if (duration.days > 0) {
    durationString += `${Duration.fromObject({days: duration.days}).toFormat("d")}d`;
  }

  if (duration.hours > 0) {
    durationString += `${Duration.fromObject({hours: duration.hours}).toFormat("h")}h`;
  }

  if (duration.minutes > 0) {
    durationString += `${Duration.fromObject({minutes: duration.minutes}).toFormat("m")}m`;
  }

  if ((shouldShowSeconds || seconds < 10 * 60) && (duration.seconds > 0 || seconds === 0)) {
    durationString += `${Duration.fromObject({seconds: duration.seconds}).toFormat("s")}s`;
  }

  return durationString;
}

class ChildBudgetBadge extends React.Component<any, any> {
  public render() {
    const { remainingBudget, shouldShowSeconds = true, totalBudget } = this.props;

    const totalBudgetDurationString = secondsToDurationString(Number(totalBudget), shouldShowSeconds);

    if (remainingBudget === undefined) {
      return (
        <Badge style={{ backgroundColor: remainingBudget < 90 ? "red" : "#777" }}>
          {totalBudgetDurationString}
        </Badge>
      );
    }

    const remainingBudgetDurationString = secondsToDurationString(Number(remainingBudget), shouldShowSeconds);

    return (
      <Badge style={{ backgroundColor: remainingBudget < 90 ? "red" : "#777" }}>
        {remainingBudgetDurationString}
        {" of "}
        {totalBudgetDurationString}
        {" left"}
      </Badge>
    );
  }
}

export { ChildBudgetBadge };
