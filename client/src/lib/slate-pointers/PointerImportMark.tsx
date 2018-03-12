import * as React from "react";
import * as uuidv1 from "uuid/v1";
import styled from "styled-components";
import ReactDOM = require("react-dom");
import { changeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import { connect } from "react-redux";
import { compose } from "recompose";
import _ = require("lodash");
import { exportingPointersSelector } from "../../modules/blocks/exportingPointers";
import { PointerImport } from "../../components/PointerImport";

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
    background: ${(props: any) => props.isSelected ? "rgba(111, 186, 209, 0.66)" : "rgba(158, 224, 244, 0.66)"};
    padding: 0px 5px;
    border-radius: 2px;
    font-weight: 500;
    transition: background-color color 0.8s; 
    display: inline-block;
    &:hover {
        cursor: pointer;
    }
`;

export class PointerImportMark extends React.Component<any, any> {
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
        const isSelected = this.props.isSelected;
        const importingPointer = this.props.importingPointer;
        if (!this.props.importingPointer) {
            return (
                <RemovedPointer
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                >
                    N/A
                </RemovedPointer>
            );
        }

        if (!this.props.isOpen) {
            const pointerIndex = this.props.pointerIndex;
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
                <OpenPointerImport
                    isSelected={isSelected}
                >
                    <PointerImport
                        exportingPointer={importingPointer}
                        onMouseOver={this.onMouseOver}
                        onMouseOut={this.props.onMouseOut}
                    />
                </OpenPointerImport>
            );
        }
    }
}