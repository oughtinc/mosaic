import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { seededStore } from "./store";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

ReactDOM.render(
  <App store={seededStore} rootNodeId="8124" />,
  document.getElementById("root") as HTMLElement
);

registerServiceWorker();
