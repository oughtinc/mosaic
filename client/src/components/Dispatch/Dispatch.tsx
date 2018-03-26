// This component is used for development (so that we can see how
// each element in the store is rendered), but won't be used for he
// final app.

import * as React from "react";

import HyperText from "../HyperText/HyperText";
import Link from "../Link/Link";
import Node from "../Node/Node";
import NodeVersion from "../NodeVersion/NodeVersion";
import WorkspaceVersion from "../WorkspaceVersion/WorkspaceVersion";
import Workspace from "../Workspace/Workspace";
import Store from "../../store";
import {
  Row,
  HyperTextRow,
  HyperTextNode,
  NodeVersionRow,
  WorkspaceRow,
  NodeRow,
  WorkspaceVersionRow,
  LinkRow
} from "../../data/types";

interface DispatchProps {
  object: Row;
  store: Store;
}

function mockRenderNode({
  value,
  store
}: {
  value: HyperTextNode;
  store: Store;
}) {
  return <span>[Node: {value.nodeId}] (mock renderer)</span>;
}

const Dispatch: React.SFC<DispatchProps> = ({ object, store }) => {
  if (object.type === "HyperText") {
    return (
      <HyperText
        value={(object as HyperTextRow).value}
        store={store}
        renderNode={mockRenderNode}
      />
    );
  }
  if (object.type === "NodeVersion") {
    return (
      <NodeVersion
        value={(object as NodeVersionRow).value}
        store={store}
        renderNode={mockRenderNode}
      />
    );
  }
  if (object.type === "WorkspaceVersion") {
    return (
      <WorkspaceVersion
        value={(object as WorkspaceVersionRow).value}
        store={store}
      />
    );
  }
  if (object.type === "Node") {
    return (
      <Node
        value={(object as NodeRow).value}
        store={store}
        renderNode={mockRenderNode}
      />
    );
  }
  if (object.type === "Workspace") {
    return <Workspace value={(object as WorkspaceRow).value} store={store} />;
  }
  if (object.type === "Link") {
    return (
      <Link
        value={(object as LinkRow).value}
        store={store}
        renderNode={mockRenderNode}
      />
    );
  }
  return (
    <div>
      <p>Don't know how to render {object.type} without context.</p>
      <pre>{JSON.stringify(object.value, null, 2)}</pre>
    </div>
  );
};

export default Dispatch;
