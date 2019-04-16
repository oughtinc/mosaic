import * as React from "react";

export class CompactTreeRowLabel extends React.PureComponent<any, any> {
  public render() {
    return (
      <div
        style={{
          fontWeight: 600,
          paddingRight: "10px",
          textAlign: "right",
          minWidth: "100px",
        }}
      >
        {this.props.children}
      </div>
    );
  }
}