import * as React from "react";
import * as uuidv1 from "uuid/v1";
import styled from "styled-components";
import ReactDOM = require("react-dom");
import { changeHoverItem } from "../../modules/blockEditor/actions";
import { connect } from "react-redux";
import { compose } from "recompose";
import _ = require("lodash");
import { exportingLeavesSelector } from "../../modules/blocks/ExportSelector";

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
        this.props.changeHoverItem({ hoverItemType: "IMPORT", id: this.props.mark.data.internalReferenceId, top, left, blockId: this.props.blockId });
    }

    public render() {
        const {internalReferenceId} = this.props.mark.data;
        const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
        const isOpen = reference && reference.isOpen;
        if (!isOpen) {
            const leafIndex = _.findIndex(this.props.exportingLeaves, (l: any) => l.pointerId === this.props.mark.data.pointerId);
            return (
                <ClosedPointerImport
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                >
                    {`$${leafIndex + 1}`}
                </ClosedPointerImport>
            );
        } else {
            const importLeaf: any = this.props.exportingLeaves.find((l: any) => l.pointerId === this.props.mark.data.pointerId);
            return (
                <OpenPointerImport
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                >
                {importLeaf && importLeaf.text}
                </OpenPointerImport>
            );
        }
    }
}

function mapStateToProps(state: any, {blockId}: any) {
  const exportingLeaves = exportingLeavesSelector(state);
  const {blocks, blockEditor} = state;
  const block = blocks.blocks.find((b) => b.id === blockId);
  return {blocks, block, blockEditor, exportingLeaves};
}

export const PointerImportMark: any = compose(
    connect(
        (mapStateToProps), {changeHoverItem }
    )
)(PointerImportMarkPresentational);