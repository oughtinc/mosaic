import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";

// For TS to recognize window.Intercom
declare global {
  interface Window {
    Intercom: any;
  }
}
window.Intercom = window.Intercom || {};

window.Intercom("boot", {
  app_id: "gmkvd6s1",
});

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
