import * as _ from "lodash";
import * as React from "react";

import HyperTextArray from "./HyperTextArray";
import HyperTextNode from "./HyperTextNode";
import HyperTextObject from "./HyperTextObject";
import {
  HyperTextValue,
  HyperTextObject as HyperTextObjectT,
  HyperTextNode as HyperTextNodeT
} from "../../data/types";

import "./HyperText.css";

function isNode(value: HyperTextValue) {
  return _.isObject(value) && _.has(value, "nodeId");
}

interface HyperTextProps {
  value: HyperTextValue;
}

const HyperText: React.SFC<HyperTextProps> = ({ value }) => {
  if (_.isString(value)) {
    return <span className="HyperText HyperText-Text">{value}</span>;
  }
  if (_.isArray(value)) {
    return <HyperTextArray value={value} />;
  }
  if (isNode(value)) {
    return <HyperTextNode value={value as HyperTextNodeT} />;
  }
  if (_.isObject(value)) {
    return <HyperTextObject value={value as HyperTextObjectT} />;
  }
  return (
    <span className="HyperText HyperText-Other">
      {JSON.stringify(value, null, 2)}
    </span>
  );
};

export default HyperText;
