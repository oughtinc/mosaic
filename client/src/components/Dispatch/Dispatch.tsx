// This component is used for development (so that we can
// see how each element in the store is rendered), but won't
// be used for he final app.

import * as React from "react";

import HyperText from "../HyperText/HyperText";
import NodeVersion from "../NodeVersion/NodeVersion";
import { Row, HyperTextRow, NodeVersionRow } from "../../data/types";

interface DispatchProps {
  object: Row;
}

const Dispatch: React.SFC<DispatchProps> = ({ object }) => {
  if (object.type === "HyperText") {
    return <HyperText value={(object as HyperTextRow).value} />;
  }
  if (object.type === "NodeVersion") {
    return <NodeVersion value={(object as NodeVersionRow).value} />;
  }
  return (
    <div>
      <p>Don't know how to render {object.type}.</p>
      <pre>{JSON.stringify(object.value, null, 2)}</pre>
    </div>
  );
};

export default Dispatch;
