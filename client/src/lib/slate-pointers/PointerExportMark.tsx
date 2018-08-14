import { css, StyleSheet } from "aphrodite";
import styled from "styled-components";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { propsToPointerDetails } from "./helpers";

// We don't use this function but it's here if we need it later.
// function getMaxNesting(node: any): number {
//     if (!node.nodes) { return 0; }
//     const possibilities = node.nodes.filter((c) => c.object === "inline");
//     return _.max(possibilities.map((p) => (getMaxNesting(p) + 1))) || 0;
// }

export class PointerExportMark extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }

  public getLocation = () => {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { left, top, right, bottom } = rect;
    return { left, top, right, bottom };
  };

  public onMouseOver = () => {
    const { left, top, right, bottom } = this.getLocation();
    this.props.onMouseOver({ left, top, right, bottom });
  };

  public render() {
    const isSelected =
      this.props.blockEditor.hoveredItem.id ===
      this.props.nodeAsJson.data.pointerId;
    const {
      blockEditor,
      availablePointers,
      nodeAsJson,
      children,
    }: any = this.props;

    const pointerExportBackground: any =
      isSelected
      ?
      "rgba(85, 228, 38, 0.9)"
      :
      "rgba(200, 243, 197, 0.5)";

    const { pointerIndex }: any = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });

    const styles = StyleSheet.create({
      OuterPointerExportStyle: {
        ':before': {
          backgroundColor: "rgba(12, 165, 0, 0.63)",
          color: "rgb(233, 239, 233)",
          content: `"$${parseInt(pointerIndex, 10) + 1}"`,
          borderRadius: "4px 0px 0px 4px",
          padding: "0px 3px",
        },
      },

      PointerExportStyle: {
        background: `${pointerExportBackground}`,
        color: "#000000",
        marginLeft: "0.5px",
        transition: "background 0.2s",

        ':before': {
          color: "rgba(12, 165, 0, 0.63)",
          content: `"["`,
          font: "800 1.2em sans-serif",
        },

        ':after': {
          color: "rgba(12, 165, 0, 0.63)",
          content: `"]"`,
          font: "800 1.2em sans-serif",
        },
      },
    });

    return (
      <span className={css(styles.OuterPointerExportStyle)}>
        <span
          className={css(styles.PointerExportStyle)}
          onMouseOut={this.props.onMouseOut}
        >
          {children.map((child, index) => {
            const isNestedPointer = child.props.node.object === "inline";

            if (!isNestedPointer) {
              return (
                <span key={index} onMouseOver={this.onMouseOver}>
                  {child}
                </span>
              );
            } else {
              return child;
            }
          })}
        </span>
      </span>
    );
  }
}
