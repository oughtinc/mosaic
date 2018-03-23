import * as React from "react";
import * as ReactDOM from "react-dom";

import * as store from "../../store";
import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App store={store.empty} />, div);
});
