import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Redirect } from "react-router";

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
  public constructor(props: any) {
    super(props);
    this.state = {
      normalSchedulingFailed: false,
      oracleSchedulingFailed: false,
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

  public render() {

    if (this.state.normalSchedulingFailed) {
      return (
        <ContentContainer>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no eligible workspace at this time. Please wait a minute and then refresh this page to try again.
          </span>
        </ContentContainer>
      );
    } else if (this.state.oracleSchedulingFailed) {
      return (
        <ContentContainer>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no oracle eligible workspace at this time. Please wait a minute and then refresh this page to try again.
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
      return (
        <Redirect
          to={{
            pathname: `/workspaces/${this.state.workspaceId}`,
            search: (Auth.isOracle() && this.props.oracleModeQuery.oracleMode) ? "" : "?isolated=true&timer=true",
          }}
        />
      );
    }
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
