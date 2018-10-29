import * as React from "react";
import { Badge } from "react-bootstrap";

import { convertMsToReadableDurationInfo } from "../../lib/convertMsToReadableDurationInfo";

class ChildBudgetBadge extends React.Component<any, any> {
  public render() {
    const { totalBudget } = this.props;
    const totalBudgetInSeconds = totalBudget;
    const totalBudgetInMs = totalBudgetInSeconds * 1000;

    const {
      daysToDisplay,
      hoursToDisplay,
      minutesToDisplay,
      secondsToDisplay
    } = convertMsToReadableDurationInfo(totalBudgetInMs);

    let durationString = "";

    if (daysToDisplay) {
      durationString += `${daysToDisplay}d `;
    }

    if (hoursToDisplay) {
      durationString += `${hoursToDisplay}h `;
    }

    if (minutesToDisplay) {
      durationString += `${minutesToDisplay}m `;
    }

    if (secondsToDisplay) {
      durationString += `${secondsToDisplay}s`;
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
