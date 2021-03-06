import * as _ from "lodash";
import * as React from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { RootWorkspace } from "./RootWorkspace";

import { ExperimentLink } from "../../components/ExperimentLink";

class ListOfRootWorkspaces extends React.Component<any, any> {
  public state = {
    displayFormat: "experiment",
  };

  public render() {
    const { workspaces, isLoading } = this.props;

    const experiments = _(workspaces)
      .flatMap(w => w.tree.experiments)
      .uniqBy((e: any) => e.id)
      .sortBy((e: any) => -Date.parse(e.createdAt))
      .map(e => ({
        ...e,
        workspaces: workspaces.filter(w =>
          w.tree.experiments.find(e2 => e.id === e2.id),
        ),
      }))
      .value();

    return (
      <div>
        <ToggleButtonGroup
          bsSize="xsmall"
          type="radio"
          name="options"
          value={this.state.displayFormat}
          onChange={this.handleDisplayFormatChange}
        >
          <ToggleButton value={"experiment"}> group by experiment</ToggleButton>
          <ToggleButton value={"all"}>show all</ToggleButton>
        </ToggleButtonGroup>
        {isLoading ? (
          <div style={{ marginTop: "10px" }}>Loading...</div>
        ) : (
          <div>
            {this.state.displayFormat === "experiment" &&
              experiments.map(e => (
                <div key={e.id}>
                  <ExperimentLink experiment={e}>
                    <h1 style={{ fontSize: "22px" }}>{e.name}</h1>
                  </ExperimentLink>
                  {e.workspaces.map(w => (
                    <RootWorkspace
                      key={`${e.id}${w.id}`}
                      sourceQueries={["RootWorkspacesQuery"]}
                      style={{
                        margin: "5px 0",
                      }}
                      workspace={w}
                    />
                  ))}
                </div>
              ))}
            {this.state.displayFormat === "all" && (
              <div>
                <h1 style={{ fontSize: "22px" }}>All Questions</h1>
                {workspaces.map(w => (
                  <RootWorkspace
                    key={`${w.id}`}
                    style={{
                      margin: "5px 0",
                    }}
                    workspace={w}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  private handleDisplayFormatChange = value => {
    this.setState({ displayFormat: value });
  };
}

export { ListOfRootWorkspaces };
