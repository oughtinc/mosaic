import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Helmet } from "react-helmet";
import { compose } from "recompose";
import { parse as parseQueryString } from "query-string";

import { EpisodeNav } from "./EpisodeShowPage/EpisodeNav";
import { Auth } from "../auth";
import { ContentContainer } from "../components/ContentContainer";
import { UserActivity } from "../components/UserActivity";

export class BetweenEpisodesPagePresentational extends React.Component<
  any,
  any
> {
  public state = {
    hasLeftCurrentWorkspace: false,
  };

  public async componentDidMount() {
    const queryParams = parseQueryString(window.location.search);

    await this.props.leaveCurrentWorkspaceMutation({
      variables: {
        experimentId: queryParams.experiment || queryParams.e,
      },
    });
    this.setState({
      hasLeftCurrentWorkspace: true,
    });
  }

  public render() {
    const queryParams = parseQueryString(window.location.search);

    return (
      <div>
        <Helmet>
          <title>Between Assignments - Mosaic</title>
        </Helmet>
        {Auth.isAuthenticated() && (
          <EpisodeNav
            experimentId={queryParams.experiment || queryParams.e}
            hasParent={false}
            hasTimer={false}
            hasTimerEnded={true}
            isTakingABreak={true}
            isInOracleMode={this.props.oracleModeQuery.oracleMode}
          />
        )}
        <ContentContainer>
          <div style={{ textAlign: "center" }}>
            Great job! Now is your chance to take a break. Press the button
            above when you're ready to start on the next workspace.
          </div>
          {this.state.hasLeftCurrentWorkspace && (
            <UserActivity experimentId={queryParams.experiment} />
          )}
        </ContentContainer>
      </div>
    );
  }
}

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const LEAVE_CURRENT_WORKSPACE_MUTATION = gql`
  mutation leaveCurrentWorkspace($experimentId: String) {
    leaveCurrentWorkspace(experimentId: $experimentId)
  }
`;

export const BetweenEpisodesPage = compose(
  graphql(LEAVE_CURRENT_WORKSPACE_MUTATION, {
    name: "leaveCurrentWorkspaceMutation",
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
)(BetweenEpisodesPagePresentational);
