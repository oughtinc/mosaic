import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { ShowExpandedPointer } from "./ShowExpandedPointer";
import { propsToPointerDetails } from "./helpers";

const RemovedPointer = styled.span`
  background-color: rgba(252, 86, 86, 0.66);
  padding: 0 3px;
  border-radius: 2px;
  font-weight: 800;
  color: #7f0a0a;
`;

const ClosedPointerImport: any = styled.span`
  background-color: rgba(86, 214, 252, 0.66);
  padding: 0 7px;
  border-radius: 2px;
  font-weight: 800;
  color: #0a6e7f;
  transition: background-color color 0.8s;
  &:hover {
    transition: background-color color 0.8s;
    cursor: pointer;
    background-color: rgb(112, 183, 201);
    color: #044550;
  }
`;

const OpenPointerImport: any = styled.div`
  background: ${(props: any) =>
    props.isSelected
      ? "rgba(111, 186, 209, 0.66)"
      : "rgba(158, 224, 244, 0.66)"};
  padding: 0px 5px;
  border-radius: 2px;
  font-weight: 500;
  transition: background-color color 0.8s;
  display: inline-block;
  &:hover {
    cursor: pointer;
  }
`;

export class PointerImportNode extends React.Component<any, any> {
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
    if (this.props.isHoverable) {
      const loc = this.getLocation();
      if (loc) {
        const { left, right, top, bottom } = loc;
        this.props.onMouseOver({
          left,
          right,
          top,
          bottom,
          id: this.props.nodeAsJson.data.internalReferenceId
        });
      }
    }
  };

  public render() {
    const { blockEditor, availablePointers, nodeAsJson } = this.props;

    const {
      importingPointer,
      isSelected,
      pointerIndex,
      isOpen
    } = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });

    if (!importingPointer) {
      return (
        <RemovedPointer
          onMouseOver={this.onMouseOver}
          onMouseOut={this.props.onMouseOut}
        >
          N/A
        </RemovedPointer>
      );
    }

    if (!isOpen) {
      return (
        <ClosedPointerImport
          onMouseOver={this.onMouseOver}
          onMouseOut={this.props.onMouseOut}
        >
          {`$${pointerIndex + 1}`}
        </ClosedPointerImport>
      );
    } else {
      return (
        <OpenPointerImport isSelected={isSelected}>
          <ShowExpandedPointer
            blockEditor={blockEditor}
            exportingPointer={importingPointer}
            availablePointers={availablePointers}
            onMouseOverExpandedPointer={this.onMouseOver}
            onMouseOverPointerImport={this.props.onMouseOver}
            onMouseOut={this.props.onMouseOut}
            isHoverable={this.props.isHoverable}
          />
        </OpenPointerImport>
      );
    }
  }
}
