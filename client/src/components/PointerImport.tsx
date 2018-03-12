import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import styled from "styled-components";
import { PointerImportMark } from "./BlockEditor/PointerImportMark";

export class LeafNode extends React.Component<any, any> {
    public render() {
        return (
            <span
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.props.node.text}
            </span>
        );
    }
}

//    <ClosedPointerImport>$33</ClosedPointerImport> 
export class InlineNode extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = { id: uuidv1() };
    }

    public render() {
        return (
            <div> Thing goes here! </div>
            // <PointerImportMark
            //     mark={{ data: { pointerId: this.props.node.data.pointerId, internalReferenceId: this.state.id } }}
            // />
        );
    }
}

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

export class PointerImport extends React.Component<any, any> {
    public render() {
        return (
            <div>
                {this.props.exportingPointer.nodes.map((node) => {
                    if (node.object === "inline" || node.object === "GeneratedNestedExportNode") {
                        return <InlineNode node={node} pointerId={this.props.exportingPointer.pointerId} />;
                    } else {
                        return <LeafNode
                            node={node}
                            onMouseOver={this.props.onMouseOver}
                            onMouseOut={this.props.onMouseOut}
                        />;
                    }
                })}
            </div>
        );
    }
}