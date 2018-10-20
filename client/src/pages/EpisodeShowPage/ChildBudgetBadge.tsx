import { Duration } from "luxon";
import * as React from "react";
import { Badge } from "react-bootstrap";

class ChildBudgetBadge extends React.Component<any, any> {
  public render() {
    const { totalBudget } = this.props;
    const totalBudgetInSeconds = totalBudget;
    const totalBudgetInMs = totalBudgetInSeconds * 1000;
    const durationInMs = Duration.fromMillis(totalBudgetInMs);
    const duration = durationInMs.shiftTo("days", "hours", "minutes", "seconds");

    let durationString = "";

    if (duration.days > 0) {
      durationString += `${Duration.fromObject({days: duration.days}).toFormat("d")}d `;
    }

    if (duration.hours > 0) {
      durationString += `${Duration.fromObject({hours: duration.hours}).toFormat("h")}h `;
    }

    if (duration.minutes > 0) {
      durationString += `${Duration.fromObject({minutes: duration.minutes}).toFormat("m")}m `;
    }

    if (duration.seconds > 0) {
      durationString += `${Duration.fromObject({seconds: duration.seconds}).toFormat("s")}s`;
    }

    return (
      <Badge>
        {durationString}
        {totalBudgetInSeconds >= 1 && " budget"}
      </Badge>
    );
  }
}

export { ChildBudgetBadge };
