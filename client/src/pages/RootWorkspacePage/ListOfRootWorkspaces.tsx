import * as _ from "lodash";
import * as React from "react";
import { RootWorkspace } from "./RootWorkspace";

const ListOfRootWorkspaces = ({ isLoading, workspaces }) => {
  const experiments = _(workspaces)
    .flatMap(w => w.tree.experiments)
    .uniqBy((e: any) => e.id)
    .sortBy((e: any) => -Date.parse(e.createdAt))
    .map(e => ({
      ...e,
      workspaces: workspaces.filter(w => w.tree.experiments.find(e2 => e.id === e2.id))
    }))
    .value();

  return (
    <div>
      {
        isLoading
        ?
        "Loading..."
        :
          <div>
            {
              experiments.map(e => 
                <div key={e.id}>
                  <h1 style={{fontSize: "22px"}}>{e.name}</h1>
                  {e.workspaces.map(w => 
                    <RootWorkspace
                      key={`${e.id}${w.id}`}
                      style={{
                        margin: "5px 0",
                      }}
                      workspace={w}
                    />
                  )}
                </div>
              )
            }
            <h1 style={{fontSize: "22px"}}>all workspaces</h1>
            {workspaces.map(w => 
              <RootWorkspace
                key={`${w.id}`}
                style={{
                  margin: "5px 0",
                }}
                workspace={w}
              />
            )}
          </div>
      }
    </div>
  );
};

export { ListOfRootWorkspaces };
