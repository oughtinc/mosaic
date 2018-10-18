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
            color: availableBudgetHeaderFontColor,
            fontSize: availableBudgetHeaderFontSize,
            fontVariant: "small-caps",
            fontWeight: 700,
          }}
        >
          <Glyphicon glyph="piggy-bank" /> budget remaining
        </span>
        <br />

        <ReadableDuration
          durationInMs={(this.props.totalBudget - this.props.allocatedBudget) * 1000}
        />
      </span>
    );
  }
}
