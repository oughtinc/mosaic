import * as React from "react";
import * as uuidv1 from "uuid/v1";
import styled from "styled-components";
import ReactDOM = require("react-dom");
import { changeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import { connect } from "react-redux";
import { compose } from "recompose";
import _ = require("lodash");
import { exportingPointersSelector } from "../../modules/blocks/exportingPointers";

const ClosedPointerImport = styled.span`
    background-color: rgba(86, 214, 252, 0.66);
    padding: 0px 7px;
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

const OpenPointerImport = styled.span`
    background-color: rgba(158, 224, 244, 0.66);
    padding: 0px 5px;
    border-radius: 2px;
    font-weight: 500;
    transition: background-color color 0.8s; 
    &:hover {
        cursor: pointer;
    }
`;

class PointerImportMarkPresentational extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.getLocation = this.getLocation.bind(this);
    }

    public getLocation() {
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        return {top: `${rect.top - 40}px`, left: `${rect.left + 10}px`};
    }

    public onMouseOver() {
        const {top, left} = this.getLocation();
        this.props.changeHoverItem({
            hoverItemType: HOVER_ITEM_TYPES.POINTER_IMPORT, 
           id: this.props.mark.data.internalReferenceId,
           top,
           left,
           blockId: this.props.blockId,
        });
    }

    public render() {
        const {internalReferenceId} = this.props.mark.data;
        const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
        const isOpen = reference && reference.isOpen;
        if (!isOpen) {
            const pointerIndex = _.findIndex(this.props.exportingPointers, (l: any) => l.pointerId === this.props.mark.data.pointerId);
            return (
                <ClosedPointerImport
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                >
                    {`$${pointerIndex + 1}`}
                </ClosedPointerImport>
            );
        } else {
            const importingPointer: any = this.props.exportingPointers.find((l: any) => l.pointerId === this.props.mark.data.pointerId);
            return (
                <OpenPointerImport
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                >
                {importingPointer && importingPointer.text}
                </OpenPointerImport>
            );
        }
    }
}

function mapStateToProps(state: any, {blockId}: any) {
  const exportingPointers = exportingPointersSelector(state);
  const {blocks, blockEditor} = state;
  const block = blocks.blocks.find((b) => b.id === blockId);
  return {blocks, block, blockEditor, exportingPointers};
}

export const PointerImportMark: any = compose(
    connect(
        (mapStateToProps), {changeHoverItem }
    )
)(PointerImportMarkPresentational);