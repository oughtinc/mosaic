import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Redirect } from "react-router";

export class CurrentEpisodeShowPagePresentational extends React.Component<any, any> {
  public render() {
    if (this.props.currentWorkspaceQuery.loading) {
      return <div>Finding your current workspace...</div>;
    } else {
      if (!this.props.currentWorkspaceQuery.currentWorkspace) {
        return <Redirect to="next" />;
      }

      const currentWorkspaceId = this.props.currentWorkspaceQuery.currentWorkspace.id;

      return (
        <Redirect to={`/workspaces/${currentWorkspaceId}`} />
      );
    }
  }
}

const CURRENT_WORKSPACE_QUERY = gql`
  query currentWorkspace {
    currentWorkspace {
      id
    }
  }
`;

export const CurrentEpisodeShowPage = compose(
  graphql(CURRENT_WORKSPACE_QUERY, {
    name: "currentWorkspaceQuery",
    options: {
      fetchPolicy: "network-only",
    },
  })
)(CurrentEpisodeShowPagePresentational);
