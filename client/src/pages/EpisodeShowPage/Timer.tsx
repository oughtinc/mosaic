import * as React from "react";
import * as moment from "moment";
import { Glyphicon } from "react-bootstrap";

export class Timer extends React.Component<any,  any> {
  public render() {
    return (
      <span>
        <span
          style={{
            display: this.props.timeLeft === Infinity ? "none" : "inline"
          }}
        >
          <span
            style={{
              color: "#137a9a",
              fontVariant: "small-caps",
              fontWeight: 700,
            }}
          >
            <Glyphicon glyph="time" /> time left
          </span>
            <br />
          <span
            style={{
              fontSize: "28px",
            }}
          >
            {moment(this.props.timeLeft).format("m")}
          </span>
          m
          {" "}
          <span
            style={{
              fontSize: "28px",
            }}
          >
            {moment(this.props.timeLeft).format("ss")}
          </span>
          s
        </span>
      </span>
    );
  }
}
