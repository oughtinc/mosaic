import * as React from "react";
import { Glyphicon } from "react-bootstrap";

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
        <span
          style={{
            fontSize: "28px",
          }}
        >
          {this.props.totalBudget - this.props.allocatedBudget}
        </span>
        {" "}
        out of
        {" "}
        <span
          style={{
            fontSize: "28px",
          }}
        >
            {this.props.totalBudget}
        </span>
      </span>
    );
  }
}
