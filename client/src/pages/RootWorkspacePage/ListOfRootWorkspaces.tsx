import * as React from "react";
import { RootWorkspace } from "./RootWorkspace";

const ListOfRootWorkspaces = ({ isLoading, workspaces }) => (
  <div>
    {
      isLoading
      ?
      "Loading..."
      :
      workspaces.map(w =>
        <RootWorkspace
          key={w.id}
          style={{
            margin: "3px",
          }}
          workspace={w}
        />
      )
    }
  </div>
);

export { ListOfRootWorkspaces };
