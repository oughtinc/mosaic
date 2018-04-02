import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import Store from "../../store";
import IndexPage from "../../pages/IndexPage/IndexPage";
import NodePage from "../../pages/NodePage/NodePage";

import "./App.css";

interface RoutesProps {
  store: Store;
}

const Routes: React.SFC<RoutesProps> = routeProps => (
  <>
    <Route
      exact={true}
      path="/"
      render={props => <IndexPage {...props} store={routeProps.store} />}
    />
    <Route
      exact={true}
      path="/nodes/:nodeId"
      render={props => <NodePage {...props} store={routeProps.store} />}
    />
  </>
);

interface AppProps {
  store: Store;
}

const App: React.SFC<AppProps> = props => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes store={props.store} />
      </BrowserRouter>
    </div>
  );
};

export default App;
