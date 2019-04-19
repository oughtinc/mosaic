import { css, StyleSheet } from "aphrodite";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { parse as parseQueryString } from "query-string";

import { propsToPointerDetails } from "./helpers";

import { addExportIdToStore } from "../../modules/blockEditor/actions";
import { getInputCharCount } from "../../modules/blocks/charCounts";

// We don't use this function but it's here if we need it later.
// function getMaxNesting(node: any): number {
//     if (!node.nodes) { return 0; }
//     const possibilities = node.nodes.filter((c) => c.object === "inline");
//     return _.max(possibilities.map((p) => (getMaxNesting(p) + 1))) || 0;
// }

const darkGreen = "rgba(12, 165, 0, 0.63)";
const bracketFont = "800 1.2em sans-serif";

export class PointerExportMarkPresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }

  public componentDidMount() {
    const exportPointerId: string = this.props.nodeAsJson.data.pointerId;
    this.props.addExportIdToStore(exportPointerId);
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

    const isExportPointerFirstNodeTextNode = nodeAsJson.nodes[0].object === "text";
    const exportPointerText = nodeAsJson.nodes[0].leaves[0].text.trim();
    const isLazyPointer = this.props.isLazyPointer || (isExportPointerFirstNodeTextNode && exportPointerText.slice(0, 2) === "@L");

    const fullExportCharCount = getInputCharCount(nodeAsJson);

    const isInExperiment = parseQueryString(window.location.search).experiment;

    const pointerExportBackground: any =
    (fullExportCharCount > 650 / 3 && isInExperiment)
    ?
    "orange"
    :
    (
      isSelected
      ?
      "rgba(85, 228, 38, 0.9)"
      :
      "rgba(200, 243, 197, 0.5)"
    );

    const { pointerIndex }: any = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });

    const styles = StyleSheet.create({
      OuterPointerExportStyle: {
        ":before": {
          backgroundColor: isLazyPointer ? "red" : darkGreen,
          color: "rgb(233, 239, 233)",
          content: `" ${parseInt(pointerIndex, 10) + 1} "`,
          borderRadius: "4px 0px 0px 4px",
          padding: "0px 3px",
        },
      },

      PointerExportStyle: {
        background: `${pointerExportBackground}`,
        color: "#000000",
        marginLeft: "0.5px",
        transition: "background 0.2s",

        ":before": {
          color: darkGreen,
          content: `"["`,
          font: bracketFont,
        },

        ":after": {
          color: darkGreen,
          content: `"]"`,
          font: bracketFont,
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

export const PointerExportMark: any = connect(
  null,
  { addExportIdToStore }
)(PointerExportMarkPresentational);
