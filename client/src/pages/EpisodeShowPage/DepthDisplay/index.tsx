import * as React from "react";
import { Glyphicon } from "react-bootstrap";

import {
  depthDisplayHeaderFontColor,
  depthDisplayHeaderFontSize,
} from "../../../styles";

class DepthDisplayPresentational extends React.Component<any,  any> {
  public render() {
    return (
      <div
        style={{ display: "flex" }}
      >
        <span>
          <span
            style={{
              alignItems: "center",
              color: depthDisplayHeaderFontColor,
              display: "flex",
              fontSize: depthDisplayHeaderFontSize,
              fontVariant: "small-caps",
              fontWeight: 700,
              justifyItems: "space-between",
              marginRight: "30px",
            }}
          >
            <Glyphicon glyph="sort" style={{ fontSize: "24px", marginRight: "5px" }}/>
            depth level
            <div
              style={{
                color: 6 - this.props.depth <= 1 ? (6 - this.props.depth === 1 ? "yellow" : "red") : "#666",
                fontSize: "24px",
                margin: "3px 0 0 5px",
                textAlign: "center",
                textShadow: this.props.inputCharCount >= 550 && this.props.inputCharCount < 650 && "0 0 1px #333",
              }}
            >
              {6 - this.props.depth}
            </div>
          </span>
        </span>
      </div>
    );
  }
}

export const DepthDisplay = DepthDisplayPresentational;
