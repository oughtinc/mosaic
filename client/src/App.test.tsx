import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { emptyStore } from "./store";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App store={emptyStore} rootNodeId="0" />, div);
});
