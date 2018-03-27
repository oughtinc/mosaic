import * as React from "react";

import Store from "../../store";
import NodeVersion from "../NodeVersion/NodeVersion";
import { LinkValue, NodeVersionRow, RenderNode } from "../../data/types";
import { LinkAccess } from "../../data/classes";

import "./Link.css";

interface LinkProps {
  value: LinkValue;
  store: Store;
  renderNode: RenderNode;
}

const Link: React.SFC<LinkProps> = ({ value, store, renderNode }) => {
  const { nodeVersionId, access } = value;
  const nodeVersion = store.get("NodeVersion", nodeVersionId) as NodeVersionRow;
  return (
    <div className="Link">
      <div className="Link-Access">
        Access: {access === LinkAccess.Write ? "Write" : "Read"}
      </div>
      <NodeVersion
        value={nodeVersion.value}
        store={store}
        renderNode={renderNode}
      />
    </div>
  );
};

export default Link;
