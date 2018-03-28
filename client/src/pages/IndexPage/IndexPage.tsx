import * as React from "react";
import * as _ from "lodash";

import Dispatch from "../../components/Dispatch/Dispatch";

import Store from "../../store";

interface IndexPageProps {
  store: Store;
}

const IndexPage: React.SFC<IndexPageProps> = props => {
  const db = props.store.dump();
  return (
    <div className="IndexPage">
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

export default IndexPage;
