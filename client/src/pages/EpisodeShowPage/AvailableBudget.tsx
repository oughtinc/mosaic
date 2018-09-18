import * as React from "react";
import { Glyphicon } from "react-bootstrap";

export class AvailableBudget extends React.Component<any,  any> {
  public render() {
    return (
      <div style={this.props.style}>
        <span
          style={{
            color: "#337ab7",
            fontVariant: "small-caps",
            fontSize: "18px",
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
      </div>
    );
  }
}
