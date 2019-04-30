import * as React from "react";

export class CompactTreeRow extends React.PureComponent<any, any> {
  public render() {
    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "5px",
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
