import { Duration } from "luxon";
import * as React from "react";
import { Badge } from "react-bootstrap";

function secondsToDurationString(seconds) {
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

  if (duration.seconds > 0 || seconds === 0) {
    durationString += `${Duration.fromObject({seconds: duration.seconds}).toFormat("s")}s`;
  }

  return durationString;
}

class ChildBudgetBadge extends React.Component<any, any> {
  public render() {
    const { remainingBudget, totalBudget } = this.props;

    const remainingBudgetDurationString = secondsToDurationString(remainingBudget);
    const totalBudgetDurationString = secondsToDurationString(totalBudget);

    return (
      <Badge style={{ backgroundColor: remainingBudget < 10 ? "red" : "#777" }}>
        {remainingBudgetDurationString}
        {" of "}
        {totalBudgetDurationString}
        {" left"}
      </Badge>
    );
  }
}

export { ChildBudgetBadge };
