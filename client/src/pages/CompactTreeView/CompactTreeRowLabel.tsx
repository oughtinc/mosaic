import * as React from "react";

export class CompactTreeRowLabel extends React.PureComponent<any, any> {
  public render() {
    return (
      <div
        style={{
          color: this.props.color,
          fontWeight: 600,
          paddingRight: "10px",
          textAlign: "right",
          minWidth: "60px",
          verticalAlign: "middle",
        }}
      >
        {this.props.children}
      </div>
    );
  }
}