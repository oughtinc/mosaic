import * as React from "react";
import * as _ from "lodash";

import Dispatch from "../Dispatch/Dispatch";
import Store from "../../store";

import "./App.css";

interface AppProps {
  store: Store;
}

const App: React.SFC<AppProps> = props => {
  const db = props.store.dump();
  return (
    <div className="App">
      <h2>Rendered</h2>
      {_.map(db, (objects, key) => (
        <div key={key}>
          <h3>{key}</h3>
          {_.values(objects).map(object => (
            <div key={object.id} style={{ margin: "1em" }}>
              <Dispatch object={object} store={props.store} />
            </div>
          ))}
        </div>
      ))}
      <h2>The store</h2>
      <pre>{JSON.stringify(db, null, 2)}</pre>
    </div>
  );
};

export default App;
