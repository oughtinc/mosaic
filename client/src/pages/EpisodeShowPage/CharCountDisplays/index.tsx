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
            input count
          </span>
          <div
            style={{
              fontSize: "28px",
              textAlign: "center",
            }}
          >
            {this.props.inputCharCount}
          </div>
        </span>
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
            }}
          >
            <Glyphicon glyph="paste" style={{ fontSize: "24px", marginRight: "5px" }}/>
            output count
          </span><div
            style={{
              fontSize: "28px",
              textAlign: "center",
            }}
          >
            {this.props.outputCharCount}
          </div>
      </span>
      </div>
    );
  }
}

export const CharCountDisplays = CharCountDisplaysPresentational;
