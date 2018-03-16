import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { PointerImportNode } from "./PointerImportNode";

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

export class InlineNode extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = { id: uuidv1() };
    }

    public render() {
        if (!this.props.blockEditor) {
            return (
                <span>no</span>
            );
        } else {
            return (
                <PointerImportNode
                    blockEditor={this.props.blockEditor}
                    exportingPointers={this.props.exportingPointers}
                    nodeAsJson={{ data: { pointerId: this.props.node.data.pointerId, internalReferenceId: this.state.id } }}
                    isHoverable={this.props.isHoverable}
                    onMouseOver={this.props.onMouseOver}
                />
            );
        }
    }
}

export class ShowExpandedPointer extends React.Component<any, any> {
    public render() {
        return (
            <div>
                {this.props.exportingPointer.nodes.map((node, index) => {
                    if (node.object === "inline" || node.object === "GeneratedNestedExportNode") {
                        return <InlineNode
                            node={node}
                            key={index}
                            blockEditor={this.props.blockEditor}
                            exportingPointers={this.props.exportingPointers}
                            pointerId={this.props.exportingPointer.pointerId}
                            onMouseOver={this.props.onMouseOverPointerImport}
                            isHoverable={this.props.isHoverable}
                        />;
                    } else {
                        return <LeafNode
                            key={index}
                            node={node.leaves[0]}
                            isHoverable={this.props.isHoverable}
                            onMouseOver={this.props.onMouseOverExpandedPointer}
                            onMouseOut={this.props.onMouseOut}
                        />;
                    }
                })}
            </div>
        );
    }
}
