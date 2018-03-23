import * as React from "react";

import HyperText from "../HyperText/HyperText";
import Store from "../../store";
import { NodeVersionValue } from "../../data/types";

interface NodeVersionProps {
  value: NodeVersionValue;
  store: Store;
}

const NodeVersion: React.SFC<NodeVersionProps> = ({ value, store }) => {
  const hyperTextId = value.hyperTextId;
  const hyperText = store.get("HyperText", hyperTextId);
  return (
    <div className="NodeVersion">
      {hyperText ? (
        <HyperText value={hyperText.value} />
      ) : (
        "Couldn't find hypertext for node version."
      )}
    </div>
  );
};

export default NodeVersion;
