import * as React from "react";

import { HyperTextNode as HyperTextNodeT } from "../../data/types";

interface HyperTextNodeProps {
  value: HyperTextNodeT;
}

const HyperTextNode: React.SFC<HyperTextNodeProps> = ({ value }) => {
  return <span className="HyperText HyperText-Node">{value.node}</span>;
};

export default HyperTextNode;
