import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";

import Node from "../../components/Node/Node";
import Store from "../../store";
import { NodeRow } from "../../data/types";

import "./NodePage.css";

interface MatchParams {
  nodeId: string;
}

interface NodePageProps extends RouteComponentProps<MatchParams> {
  store: Store;
}

const NodePage: React.SFC<NodePageProps> = props => {
  const nodeId = props.match.params.nodeId;
  const node = props.store.get("Node", nodeId);
  return (
    <div className="NodePage">
      <div className="NodePage-Header">
        <Link to="/">Home</Link>
      </div>
      {node ? (
        <Node value={(node as NodeRow).value} store={props.store} />
      ) : (
        <div>
          Node {nodeId} not found. Store:<pre>
            {JSON.stringify(props.store, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default NodePage;
