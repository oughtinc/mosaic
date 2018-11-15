import * as React from "react";
import { Glyphicon } from "react-bootstrap";

import { ReadableDuration } from "./ReadableDuration";

import {
  availableBudgetHeaderFontColor,
  availableBudgetHeaderFontSize,
} from "../../../styles";

export class AvailableBudget extends React.Component<any,  any> {
  public render() {
    return (
      <span>
        <span
          style={{
            alignItems: "center",
            color: availableBudgetHeaderFontColor,
            display: "flex",
            fontSize: availableBudgetHeaderFontSize,
            fontVariant: "small-caps",
            fontWeight: 700,
            justifyItems: "space-between",
          }}
        >
          <Glyphicon glyph="time" style={{ fontSize: "24px", marginRight: "5px" }}/>
          <span>total remaining</span>
        </span>

        <ReadableDuration
          durationInMs={(this.props.totalBudget - this.props.allocatedBudget) * 1000}
          style={{ textAlign: "center" }}
        />
      </span>
    );
  }
}
