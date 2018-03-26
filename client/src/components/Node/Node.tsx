// This component is used for development (so that we can see how
// each element in the store is rendered), but won't be used for he
// final app.

import * as React from "react";

import Store from "../../store";
import NodeVersion from "../NodeVersion/NodeVersion";
import { NodeValue, NodeVersionRow, RenderNode } from "../../data/types";

interface NodeProps {
  value: NodeValue;
  store: Store;
  renderNode: RenderNode;
}

const Node: React.SFC<NodeProps> = ({ value, store, renderNode }) => {
  const { headId } = value; // ignoring consistentId for now
  const nodeVersion = store.get("NodeVersion", headId) as NodeVersionRow;
  return (
    <div className="Node">
      <NodeVersion
        value={nodeVersion.value}
        store={store}
        renderNode={renderNode}
      />
    </div>
  );
};

export default Node;
