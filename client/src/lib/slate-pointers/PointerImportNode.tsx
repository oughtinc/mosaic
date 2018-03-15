import * as React from "react";
import styled from "styled-components";
import ReactDOM = require("react-dom");
import _ = require("lodash");
import { ShowExpandedPointer } from "./ShowExpandedPointer";

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

function translateProps({blockEditor, exportingPointers, nodeAsJson}: any) {
      const { internalReferenceId, pointerId } = nodeAsJson.data;
      const reference = blockEditor.pointerReferences[internalReferenceId];
      const isSelected = blockEditor.hoveredItem.id === internalReferenceId;
      const isOpen = reference && reference.isOpen;
      const importingPointer: any = exportingPointers.find((l: any) => l.data.pointerId === pointerId);
      const pointerIndex = _.findIndex(exportingPointers, (l: any) => l.data.pointerId === pointerId);
      return ({importingPointer, isSelected, isOpen, pointerIndex});
}

export class PointerImportNode extends React.Component<any, any> {
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
        // const {blockEditor, exportingPointers, nodeAsJson} = this.props;
        const {top, left} = this.getLocation();
        this.props.onMouseOver({top, left, id: this.props.nodeAsJson.data.internalReferenceId});
    }

    public render() {
        const {blockEditor, exportingPointers, nodeAsJson} = this.props;

        const {importingPointer, isSelected, pointerIndex, isOpen} = translateProps({
            blockEditor,
            exportingPointers,
            nodeAsJson,
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
                <OpenPointerImport
                    isSelected={isSelected}
                >
                    <ShowExpandedPointer
                        blockEditor={blockEditor}
                        exportingPointer={importingPointer}
                        exportingPointers={exportingPointers}
                        onMouseOverExpandedPointer={this.onMouseOver}
                        onMouseOverPointerImport={this.props.onMouseOver}
                        onMouseOut={this.props.onMouseOut}
                    />
                </OpenPointerImport>
            );
        }
    }
}
