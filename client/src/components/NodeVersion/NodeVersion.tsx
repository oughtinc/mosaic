import * as React from "react";

import HyperText from "../HyperText/HyperText";
import Store from "../../store";
import { NodeVersionValue, RenderNode } from "../../data/types";

interface NodeVersionProps {
  value: NodeVersionValue;
  store: Store;
  renderNode: RenderNode;
}

const NodeVersion: React.SFC<NodeVersionProps> = ({
  value,
  store,
  renderNode
}) => {
  const hyperTextId = value.hyperTextId;
  const hyperText = store.get("HyperText", hyperTextId);
  return (
    <div className="NodeVersion">
      {hyperText ? (
        <HyperText
          value={hyperText.value}
          store={store}
          renderNode={renderNode}
        />
      ) : (
        "Couldn't find hypertext for node version."
      )}
    </div>
  );
};

export default NodeVersion;
