import * as _ from "lodash";
import * as React from "react";

import HyperTextArray from "./HyperTextArray";
import HyperTextObject from "./HyperTextObject";
import Store from "../../store";
import {
  HyperTextValue,
  HyperTextObject as HyperTextObjectT,
  HyperTextNode as HyperTextNodeT,
  RenderNode
} from "../../data/types";

import "./HyperText.css";

function isNode(value: HyperTextValue) {
  return _.isObject(value) && _.has(value, "nodeId");
}

interface HyperTextProps {
  value: HyperTextValue;
  store: Store;
  renderNode: RenderNode;
}

const HyperText: React.SFC<HyperTextProps> = ({ value, store, renderNode }) => {
  if (_.isString(value)) {
    return <span className="HyperText HyperText-Text">{value}</span>;
  }
  if (_.isArray(value)) {
    return (
      <HyperTextArray value={value} store={store} renderNode={renderNode} />
    );
  }
  if (isNode(value)) {
    return renderNode({ value: value as HyperTextNodeT, store });
  }
  if (_.isObject(value)) {
    return (
      <HyperTextObject
        value={value as HyperTextObjectT}
        store={store}
        renderNode={renderNode}
      />
    );
  }
  return (
    <span className="HyperText HyperText-Other">
      {JSON.stringify(value, null, 2)}
    </span>
  );
};

export default HyperText;
