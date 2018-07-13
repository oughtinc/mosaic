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

const pointerExportBackground: any = ({ isSelected, isDisplayMode }: any) => {
  if (isSelected) {
    return "rgba(85, 228, 38, 0.9)";
  } else if (isDisplayMode) {
    return "rgba(200, 243, 197, 0.5)";
  } else {
    return "rgba(200, 243, 197, 0.8)";
  }
};

const PointerExportStyle: any = styled.span`
  background: ${pointerExportBackground};
  margin-left: ${({ isDisplayMode }: any) => (isDisplayMode ? "3px" : "0")};
  transition: background 0.2s;
  color: #000000;
`;

const darkGreen = "rgba(12, 165, 0, 0.63)";

const Bracket = styled.span`
  color: ${darkGreen};
  font-size: 1.2em;
  font-weight: 800;
  line-height: 1em;
`;

const Tag = styled.span`
  padding: 0 3px;
  background: ${darkGreen};
  color: #e9efe9;
  margin-right: 1px;
  border-radius: 4px 0 0 4px;
  margin-left: 0px;
`;

const DisplayModeSurround = ({
  isDisplayMode,
  children,
  pointerIndex,
  onMouseOver
}: any) => {
  if (!isDisplayMode) {
    return children;
  } else {
    return (
      <span>
        <Tag onMouseOver={onMouseOver}>
          {`$${parseInt(pointerIndex, 10) + 1}`}
        </Tag>
        <Bracket onMouseOver={onMouseOver}>{"["}</Bracket>
        {children}
        <Bracket onMouseOver={onMouseOver}>{"]"}</Bracket>
      </span>
    );
  }
};

export class PointerExportMark extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }

  public getLocation = () => {
    const node = ReactDOM.findDOMNode(this);
    if (!(node instanceof Element)) {
      return null;
    }
    const rect = node.getBoundingClientRect();
    const { left, top, right, bottom } = rect;
    return { left, top, right, bottom };
  };

  public onMouseOver = () => {
    const loc = this.getLocation();
    if (loc) {
      this.props.onMouseOver(loc);
    }
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
      isDisplayMode
    }: any = this.props;

    const { pointerIndex }: any = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });
    return (
      <PointerExportStyle
        isSelected={isSelected}
        onMouseOut={this.props.onMouseOut}
        isDisplayMode={isDisplayMode}
      >
        <DisplayModeSurround
          isDisplayMode={isDisplayMode}
          pointerIndex={pointerIndex}
          onMouseOver={this.onMouseOver}
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
        </DisplayModeSurround>
      </PointerExportStyle>
    );
  }
}
