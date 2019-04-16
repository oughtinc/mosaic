import * as React from "react";

export class CompactTreeRowContent extends React.PureComponent<any, any> {
  public render() {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          padding: "5px",
        }}
      >
        {this.props.children}
      </div>
    );
  }
}