import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { HomePageHeading } from "./HomePageHeading";
import { ListOfRootWorkspaces } from "./ListOfRootWorkspaces";
import { NewRootWorkspaceForm } from "./NewRootWorkspaceForm";
import { WelcomeMessage } from "./WelcomeMessage";

import { Auth } from "../../auth";
import { CREATE_ROOT_WORKSPACE, WORKSPACES_QUERY } from "../../graphqlQueries";

export class RootWorkspacePagePresentational extends React.Component<any, any> {
  public render() {
    const isLoading = this.props.rootWorkspacesQuery.loading;

    const workspaces = _.sortBy(
      this.props.rootWorkspacesQuery.workspaces,
      workspace => Date.parse(workspace.createdAt)
    );

    return (
      <div>
        {
          !Auth.isAuthenticated()
          &&
          <WelcomeMessage />
        }

        <div
          style={{
            marginTop: "35px",
          }}
        >
          <HomePageHeading>Questions</HomePageHeading>
          <ListOfRootWorkspaces
            isLoading={isLoading}
            workspaces={workspaces}
          />
        </div>

        {
          Auth.isAuthenticated()
          &&
          <NewRootWorkspaceForm
            createWorkspace={this.props.createWorkspace}
            style={{
              marginBottom: "50px",
              marginTop: "85px",
            }}
          />
        }
      </div>
    );
  }
}

export const RootWorkspacePage = compose(
  graphql(WORKSPACES_QUERY, { name: "rootWorkspacesQuery" }),
  graphql(CREATE_ROOT_WORKSPACE, {
    name: "createWorkspace",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  })
)(RootWorkspacePagePresentational);
