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

const pointerExportBackground: any = ({ isSelected }: any) => {
  if (isSelected) {
    return "rgba(85, 228, 38, 0.9)";
  } else {
    return "rgba(200, 243, 197, 0.5)";
  }
};

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

    const { pointerIndex }: any = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });

    const isNested = availablePointers.some(pointer => {
      return pointer.nodes.some(node => {
        return (node.type === 'pointerExport' && node.data.pointerId === nodeAsJson.data.pointerId);
      })
    });

    const OuterPointerExportStyle: any = styled.span`
    &::before {
      background-color: rgba(12, 165, 0, 0.63);
      color: rgb(233, 239, 233);
      content: "$${parseInt(pointerIndex, 10) + 1}";
      border-radius: 4px 0px 0px 4px;
      margin-right: 1px;
      padding: 0px 3px;
    }`;

    const PointerExportStyle: any = styled.span`
      background: ${pointerExportBackground};
      margin-left: 1px;
      transition: background 0.2s;
      color: #000000;
      padding-left: ${isNested ? '4px' : 0 };
      padding-right: 3px;

      &::before {
        color: rgba(12, 165, 0, 0.63);
        font-size: 1.2em;
        font-weight: 800;
        content: "[";
        position: absolute;
        top: -5px;
        left: -1px;
      }

      &::after {
        color: rgba(12, 165, 0, 0.63);
        font-size: 1.2em;
        font-weight: 800;
        position: absolute;
        top: -5px;
        right: 1px;
        content: "]";
      }
    `;
    return (
      <OuterPointerExportStyle>
        <span style={{ position: 'relative' }}>
          <PointerExportStyle
            isSelected={isSelected}
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
          </PointerExportStyle>
        </span>
      </OuterPointerExportStyle>
    );
  }
}
