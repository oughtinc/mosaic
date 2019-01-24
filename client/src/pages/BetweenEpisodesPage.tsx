import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { EpisodeNav } from "./EpisodeShowPage/EpisodeNav";
import { Auth } from "../auth";
import { ContentContainer } from  "../components/ContentContainer";
import { UserActivity } from "../components/UserActivity";

export class BetweenEpisodesPagePresentational extends React.Component<any, any> {
  state = {
    hasLeftCurrentWorkspace: false,
  }

  public async componentDidMount() {
    await this.props.leaveCurrentWorkspaceMutation();
    this.setState({
      hasLeftCurrentWorkspace: true,
    });
  }

  public render() {
    return (
      <div>
        {Auth.isAuthenticated() && (
          <EpisodeNav
            hasParent={false}
            hasTimer={false}
            hasTimerEnded={true}
            isTakingABreak={true}
            isInOracleMode={this.props.oracleModeQuery.oracleMode}
          />
        )}
        <ContentContainer>
          <div style={{ textAlign: "center" }}>
          Great job! Now is your chance to take a break. Press the button above when you're ready to start on the next workspace. 
          </div>
          {
            this.state.hasLeftCurrentWorkspace
            &&
            <UserActivity />
          }
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
  mutation leaveCurrentWorkspace {
    leaveCurrentWorkspace
  }
`;

export const BetweenEpisodesPage = compose(
  graphql(LEAVE_CURRENT_WORKSPACE_MUTATION, { name: "leaveCurrentWorkspaceMutation" }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  })
)(BetweenEpisodesPagePresentational);
