import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { PointerImportNode } from "./PointerImportNode";
import * as _ from "lodash";

export class LeafNode extends React.Component<any, any> {
  public render() {
    return (
      <span
        onMouseOver={this.props.onMouseOver}
        onMouseOut={this.props.onMouseOut}
      >
        {this.props.node.leaves.map(leaf => leaf.text)}
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
      return <span>no</span>;
    } else {
      return (
        <PointerImportNode
          blockEditor={this.props.blockEditor}
          availablePointers={this.props.availablePointers}
          nodeAsJson={{
            data: {
              pointerId: this.props.node.data.pointerId,
              internalReferenceId: this.state.id
            }
          }}
          isHoverable={this.props.isHoverable}
          onMouseOver={this.props.onMouseOver}
        />
      );
    }
  }
}

export class ShowExpandedPointer extends React.Component<any, any> {
  public shouldComponentUpdate(newProps: any) {
    // Try filtering down to just the node.object==="leaf", and then node.leaves[0].

    if (
      !_.isEqual(newProps.availablePointers.nodes, this.props.availablePointers)
    ) {
      return true;
    }
    return false;
  }

  public render() {
    const isNestedAsExportingPointer = this.props.availablePointers.some(pointer => {
      return pointer.nodes.some(node => {
        return (node.type === "pointerExport" && node.data.pointerId === this.props.exportingPointer.data.pointerId);
      });
    });

    return (
      <div
        style={{
          paddingLeft: isNestedAsExportingPointer ? "5px" : 0,
        }}
      >
        {this.props.exportingPointer.nodes.map((node, index) => {
          if (
            node.object === "inline" ||
            node.object === "GeneratedNestedExportNode"
          ) {
            return (
              <span key={index} style={{ marginLeft: "4px", marginRight: "6px" }}>
                <InlineNode
                  node={node}
                  blockEditor={this.props.blockEditor}
                  availablePointers={this.props.availablePointers}
                  pointerId={this.props.exportingPointer.pointerId}
                  onMouseOver={this.props.onMouseOverPointerImport}
                  isHoverable={this.props.isHoverable}
                />
              </span>
            );
          } else {
            return (
              <LeafNode
                key={index}
                node={node}
                isHoverable={this.props.isHoverable}
                onMouseOver={this.props.onMouseOverExpandedPointer}
                onMouseOut={this.props.onMouseOut}
              />
            );
          }
        })}
      </div>
    );
  }
}
