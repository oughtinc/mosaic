import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import { ShowExpandedPointer } from "./ShowExpandedPointer";
import { propsToPointerDetails } from "./helpers";
import { changePointerReference } from '../../modules/blockEditor/actions';

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

class PointerImportNodePresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }

  public getLocation = () => {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { left, right, top, bottom } = rect;
    return { left, right, top, bottom };
  };

  public onMouseOver = () => {
    if (this.props.isHoverable) {
      const { left, right, top, bottom } = this.getLocation();
      this.props.onMouseOver({
        left,
        right,
        top,
        bottom,
        id: this.props.nodeAsJson.data.internalReferenceId
      });
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
          onClick={() => this.props.handleClickingClosedPointer(this.props.nodeAsJson.data.internalReferenceId)}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.props.onMouseOut}
        >
          {`$${pointerIndex + 1}`}
        </ClosedPointerImport>
      );
    } else {
      return (
        <OpenPointerImport
          isSelected={isSelected}
          onClick={() => this.props.handleClickingOpenPointer(this.props.nodeAsJson.data.internalReferenceId)}
        >
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

const mapDispatchToProps = dispatch => ({
  handleClickingClosedPointer: pointerId => dispatch(changePointerReference({
    id: pointerId,
    reference: { isOpen: true },
  })),

  handleClickingOpenPointer: pointerId => dispatch(changePointerReference({
    id: pointerId,
    reference: { isOpen: false },
  })),
});

export const PointerImportNode = connect(null, mapDispatchToProps)(PointerImportNodePresentational);
