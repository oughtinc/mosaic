// This is a top-level component. It will never be called recursively when we're rendering
// a hierarchy of nodes.

import * as React from "react";

import Store from "../../store";
import NodeVersion from "../NodeVersion/NodeVersion";
import NodeVersionSelector from "../NodeVersionSelector/NodeVersionSelector";
import { NodeValue, NodeVersionRow, NodeVersionTag } from "../../data/types";

import "./Node.css";

interface NodeProps {
  value: NodeValue;
  store: Store;
}

interface NodeState {
  selectedVersionTag: NodeVersionTag;
}

class Node extends React.Component<NodeProps, NodeState> {
  constructor(props: NodeProps) {
    super(props);
    this.state = {
      selectedVersionTag: NodeVersionTag.Head
    };
  }

  selectVersionTag = (selectedVersionTag: NodeVersionTag) => {
    this.setState({ selectedVersionTag });
  };

  selectedVersionId() {
    const { headId, consistentId } = this.props.value;
    if (this.state.selectedVersionTag === NodeVersionTag.Consistent) {
      return consistentId;
    }
    // For both head and latest, we start from head; the difference
    // is that for latest, we retrieve the latest version of all included
    // nodes, whereas for head, we use the version specified in the links.
    return headId;
  }

  render() {
    const selectedVersionId = this.selectedVersionId();
    if (selectedVersionId == null) {
      return (
        <div>
          Couldn't select version for tag {this.state.selectedVersionTag}.
        </div>
      );
    }
    const nodeVersion = this.props.store.get(
      "NodeVersion",
      selectedVersionId
    ) as NodeVersionRow;
    const { headId, consistentId } = this.props.value;
    const versionTags = [NodeVersionTag.Latest]
      .concat(headId ? [NodeVersionTag.Head] : [])
      .concat(consistentId ? [NodeVersionTag.Consistent] : []);
    const useLatestNodeVersions =
      this.state.selectedVersionTag === NodeVersionTag.Latest;
    return (
      <div className="Node">
        <NodeVersionSelector
          versionTags={versionTags}
          selectVersionTag={this.selectVersionTag}
          selectedVersionTag={this.state.selectedVersionTag}
          selectedVersionId={selectedVersionId}
        />
        <NodeVersion
          value={nodeVersion.value}
          store={this.props.store}
          useLatestNodeVersions={useLatestNodeVersions}
        />
      </div>
    );
  }
}

export default Node;
