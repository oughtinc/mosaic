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
    } else if (this.props.node.type === "link") {
      const href = this.props.node.data.href;
      return (
        <a
          href={href}
          onClick={e => e.stopPropagation()/* this prevents imported pointer from toggling after the user clicks a link */}
        >
          {this.props.node.nodes[0].leaves[0].text}
        </a>
      );
    } else {
      return (
        <PointerImportNode
          isInOracleMode={this.props.isInOracleMode}
          isUserOracle={this.props.isUserOracle}
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
          exportLockStatusInfo={this.props.exportLockStatusInfo}
          isInOracleModeAndIsUserOracle={this.props.isInOracleModeAndIsUserOracle}
          visibleExportIds={this.props.visibleExportIds}
          unlockPointer={this.props.unlockPointer}
        />
      );
    }
  }
}

export class ShowExpandedPointer extends React.Component<any, any> {

  public shouldComponentUpdate(newProps: any) {
    // Try filtering down to just the node.object==="leaf", and then node.leaves[0].

    if (
      !_.isEqual(newProps.availablePointers.nodes, this.props.availablePointers) ||
      !_.isEqual(newProps.exportLockStatusInfo, this.props.exportLockStatusInfo) ||
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds)
    ) {
      return true;
    }
    return false;
  }

  public render() {
    return (
      <span>
        {this.props.exportingPointer.nodes.map((node, index) => {
          if (
            node.object === "inline" ||
            node.object === "GeneratedNestedExportNode"
          ) {
            return (
              <span key={index} style={{ margin: "2px" }}>
                <InlineNode
                  isInOracleMode={this.props.isInOracleMode}
                  isUserOracle={this.props.isUserOracle}
                  node={node}
                  blockEditor={this.props.blockEditor}
                  availablePointers={this.props.availablePointers}
                  pointerId={this.props.exportingPointer.pointerId}
                  onMouseOver={this.props.onMouseOverPointerImport}
                  isHoverable={this.props.isHoverable}
                  visibleExportIds={this.props.visibleExportIds}
                  exportLockStatusInfo={this.props.exportLockStatusInfo}
                  isInOracleModeAndIsUserOracle={this.props.isInOracleModeAndIsUserOracle}
                  unlockPointer={this.props.unlockPointer}
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
      </span>
    );
  }
}
