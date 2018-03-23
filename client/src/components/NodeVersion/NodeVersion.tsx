import * as React from "react";

import { NodeVersionValue } from "../../data/types";

interface NodeVersionProps {
  value: NodeVersionValue
}

const NodeVersion: React.SFC<NodeVersionProps> = ({ value }) => <div className="NodeVersion">node version</div>;

export default NodeVersion;
