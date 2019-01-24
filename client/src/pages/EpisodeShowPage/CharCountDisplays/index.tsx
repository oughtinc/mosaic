import * as React from "react";
import { Glyphicon } from "react-bootstrap";

import {
  charCountDisplayHeaderFontColor,
  charCountDisplayHeaderFontSize,
} from "../../../styles";

class CharCountDisplaysPresentational extends React.Component<any,  any> {
  public render() {
    return (
      <div
        style={{
          display: "flex",

        }}
      >
        <span>
          <span
            style={{
              alignItems: "center",
              color: charCountDisplayHeaderFontColor,
              display: "flex",
              fontSize: charCountDisplayHeaderFontSize,
              fontVariant: "small-caps",
              fontWeight: 700,
              justifyItems: "space-between",
              marginRight: "30px",
            }}
          >
            <Glyphicon glyph="copy" style={{ fontSize: "24px", marginRight: "5px" }}/>
            input
            <div
              style={{
                color: this.props.inputCharCount < 250 ? "green" : (this.props.inputCharCount < 350 ? "yellow" : "red"),
                fontSize: "24px",
                margin: "3px 0 0 5px",
                textAlign: "center",
                textShadow: this.props.inputCharCount >= 250 && this.props.inputCharCount < 350 && "0 0 1px #333",
              }}
            >
              {350 - this.props.inputCharCount}
            </div>
          </span>
        </span>
        <span>
        <span
          style={{
            alignItems: "center",
            color: charCountDisplayHeaderFontColor,
            display: "none", // TODO: revisit, hidden for Jan 17 experiments
            fontSize: charCountDisplayHeaderFontSize,
            fontVariant: "small-caps",
            fontWeight: 700,
            justifyItems: "space-between",
          }}
        >
          <Glyphicon glyph="paste" style={{ fontSize: "24px", marginRight: "5px" }}/>
          output
          <div
            style={{
              color: this.props.outputCharCount < 300 ? "green" : (this.props.outputCharCount < 400 ? "yellow" : "red"),
              fontSize: "24px",
              margin: "3px 0 0 5px",
              textAlign: "center",
              textShadow: this.props.outputCharCount >= 300 && this.props.outputCharCount < 400 && "0 0 1px #333",
            }}
          >
            {400 - this.props.outputCharCount}
          </div>
        </span>
      </span>
      </div>
    );
  }
}

export const CharCountDisplays = CharCountDisplaysPresentational;
