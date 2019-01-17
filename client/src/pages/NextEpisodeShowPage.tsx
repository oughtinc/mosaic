import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { Auth } from "../auth";
import { ContentContainer } from  "../components/ContentContainer";

const RedExclamation = () => (
  <span
    style={{
      color: "red",
      fontSize: "24px",
      fontWeight: 700,
      padding: "0 5px 0 15px",
    }}
  >
  !
  </span>
);

export class NextEpisodeShowPagePresentational extends React.Component<any, any> {
  private countdownInterval: NodeJS.Timer;
  private isCountingDown = false;

  public constructor(props: any) {
    super(props);
    this.state = {
      normalSchedulingFailed: false,
      oracleSchedulingFailed: false,
      refreshCountdown: 10,
      workspaceId: undefined };
  }

  public async componentDidMount() {
    let response, normalSchedulingFailed, oracleSchedulingFailed;
    try {
      response = await this.props.findNextWorkspaceMutation();
    } catch (e) {
      oracleSchedulingFailed = e.message === "GraphQL error: No eligible workspace for oracle";
      normalSchedulingFailed = e.message === "GraphQL error: No eligible workspace";
    }
    if (oracleSchedulingFailed) {
      this.setState({ oracleSchedulingFailed });
    } else if (normalSchedulingFailed) {
      this.setState({ normalSchedulingFailed });
    } else if (response) {
      const workspaceId =  response.data.findNextWorkspace.id;
      this.setState({ workspaceId });
    }
  }

  public componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  public render() {
    if (this.state.refreshCountdown === 0) {
      location.reload();
    }

    if (this.state.normalSchedulingFailed) {
      this.startCountingDown();

      return (
        <ContentContainer>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no eligible workspace at this time. Please wait and refresh this page to try again.

            Automatically refreshing in {this.state.refreshCountdown} second{this.state.refreshCountdown !== 1 ? "s" : ""}.
          </span>
        </ContentContainer>
      );
    } else if (this.state.oracleSchedulingFailed) {
      this.startCountingDown();

      return (
        <ContentContainer>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no oracle eligible workspace at this time. Please wait and refresh this page to try again.
            Automatically refreshing in {this.state.refreshCountdown} second{this.state.refreshCountdown !== 1 ? "s" : ""}.
          </span>
        </ContentContainer>
      );
    } else if (!this.state.workspaceId) {
      return (
        <ContentContainer>
          Finding your next workspace...
        </ContentContainer>
      );
    } else {
      const redirectQueryParams = `${(Auth.isOracle() && this.props.oracleModeQuery.oracleMode) ? "" : "?isolated=true&timer=0:1:30"}`;
      window.location.href = `${window.location.origin}/workspaces/${this.state.workspaceId}${redirectQueryParams}`;
      return null;
    }
  }

  private startCountingDown() {
    if (this.isCountingDown) {
      return;
    }

    this.isCountingDown = true;

    this.countdownInterval = setInterval(() => this.setState({
      refreshCountdown: Math.max(0, this.state.refreshCountdown - 1),
    }), 1000);
  }
}

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const FIND_NEXT_WORKSPACE_MUTATION = gql`
  mutation findNextWorkspace {
    findNextWorkspace {
      id
    }
  }
`;

export const NextEpisodeShowPage = compose(
  graphql(FIND_NEXT_WORKSPACE_MUTATION, { name: "findNextWorkspaceMutation" }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  })
)(NextEpisodeShowPagePresentational);
