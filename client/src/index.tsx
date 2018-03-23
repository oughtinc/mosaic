import * as React from "react";
import * as ReactDOM from "react-dom";

import * as store from "./store";
import fixtures from "./data/fixtures";
import App from "./components/App/App";

// import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

// TODO: pass root workspace id here

ReactDOM.render(
  <App store={store.fromData(fixtures)} />,
  document.getElementById("root") as HTMLElement
);

// registerServiceWorker();
