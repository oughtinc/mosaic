import * as React from "react";

import HyperText from "./HyperText";

import Store from "../../store";
import {
  HyperTextArray as HyperTextArrayT,
  RenderNode
} from "../../data/types";

interface HyperTextArrayProps {
  value: HyperTextArrayT;
  store: Store;
  renderNode: RenderNode;
}

const HyperTextArray: React.SFC<HyperTextArrayProps> = ({
  value,
  store,
  renderNode
}) => {
  return (
    <span className="HyperText HyperText-Array">
      {value.map((x, i) => (
        <span key={i}>
          <HyperText value={x} store={store} renderNode={renderNode} />{" "}
        </span>
      ))}
    </span>
  );
};

export default HyperTextArray;
