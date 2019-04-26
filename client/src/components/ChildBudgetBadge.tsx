import * as React from "react";
import { Badge } from "react-bootstrap";
import { secondsToDurationString } from "./helpers/secondsToDurationString";

class ChildBudgetBadge extends React.Component<any, any> {
  public render() {
    const {
      noBadge,
      remainingBudget,
      shouldShowSeconds = true,
      style,
      totalBudget,
    } = this.props;

    const totalBudgetDurationString = secondsToDurationString(
      Number(totalBudget),
      shouldShowSeconds,
    );

    if (noBadge) {
      return <span style={style}>{totalBudgetDurationString}</span>;
    }

    if (remainingBudget === undefined) {
      return (
        <Badge
          style={{
            ...style,
            backgroundColor: remainingBudget < 90 ? "red" : "#777",
          }}
        >
          {totalBudgetDurationString}
        </Badge>
      );
    }

    const remainingBudgetDurationString = secondsToDurationString(
      Number(remainingBudget),
      shouldShowSeconds,
    );

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
