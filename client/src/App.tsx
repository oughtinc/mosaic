import * as React from "react";

import Node from "./Node";
import Store from "./store";

import "./App.css";

interface AppProps {
  store: Store;
  rootNodeId: string;
}

const App: React.SFC<AppProps> = props => {
  const node = props.store.getNode(props.rootNodeId);
  return (
    <div className="App">
      {node ? (
        <Node node={node} store={props.store} />
      ) : (
        <span>Node not found.</span>
      )}
    </div>
  );
};

export default App;
