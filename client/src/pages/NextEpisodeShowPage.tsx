import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import { parse as parseQueryString } from "query-string";

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
    const queryParams = parseQueryString(window.location.search);

    try {
      response = await this.props.findNextWorkspaceMutation({
        variables: {
          experimentId: queryParams.experiment,
        }
      });
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

          <div
            style={{
              marginLeft: "20px",
              marginTop: "50px",
            }}
          >  
            <div 
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.05)",
                border: "1px solid rgba(255, 0, 0, 0.15)",
                borderRadius: "8px",
                color: "darkRed",
                maxWidth: "500px", 
                padding: "20px",
                textAlign: "justify",
              }}
            >
              Another option is to search for a workspace that is "suboptimal" in the sense that you might have already worked on a workspace close to this one.
              <div 
                style={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px", 
                }}
              >
                <Link to="/nextMaybeSuboptimal" style={{ margin: "0 5px" }}>
                  <Button bsStyle="danger">Find Suboptimal Workspace »</Button>
                </Link>
              </div>
            </div>
          </div>
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
      const redirectQueryParams = `${(Auth.isOracle() && this.props.oracleModeQuery.oracleMode) ? "?active=true" : "?isolated=true&active=true"}`;
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
  mutation findNextWorkspace($experimentId: String) {
    findNextWorkspace(experimentId: $experimentId) {
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
