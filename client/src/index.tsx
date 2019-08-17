import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";

// For TS to recognize Intercom & FullStory
declare global {
  interface Window {
    Intercom: any;
    FS: any;
    heap: {
      identify: (id: any) => void;
      track: (name: string, properties: any) => void;
    };
  }
}
window.Intercom = window.Intercom || {};
window.FS = window.FS || {};

window.Intercom("boot", {
  app_id: "gmkvd6s1",
});

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
