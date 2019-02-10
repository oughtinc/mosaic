import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { parse as parseQueryString } from "query-string";

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

export class NextMaybeSuboptimalEpisodeShowPagePresentational extends React.Component<any, any> {
  private countdownInterval: NodeJS.Timer;
  private isCountingDown = false;

  public constructor(props: any) {
    super(props);
    this.state = {
      schedulingFailed: false,
      refreshCountdown: 10,
      workspaceId: undefined,
    };
  }

  public async componentDidMount() {
    const queryParams = parseQueryString(window.location.search);

    let response, schedulingFailed;
    
    try {
      response = await this.props.findNextMaybeSuboptimalWorkspaceMutation({
        variables: {
          experimentId: queryParams.experiment,
        }
      });
    } catch (e) {
      schedulingFailed = e.message === "GraphQL error: No eligible workspace";
    }

    if (schedulingFailed) {
      this.setState({ schedulingFailed });
    } else if (response) {
      const workspaceId =  response.data.findNextMaybeSuboptimalWorkspace.id;
      this.setState({ workspaceId });
    }
  }

  public componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  public render() {
    const queryParams = parseQueryString(window.location.search);

    if (this.state.refreshCountdown === 0) {
      location.reload();
    }

    if (this.state.schedulingFailed) {
      this.startCountingDown();

      return (
        <ContentContainer>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no eligible workspace at this time, even if we broaden our search to suboptimal workspaces. Please wait and refresh this page to try again.

            Automatically refreshing in {this.state.refreshCountdown} second{this.state.refreshCountdown !== 1 ? "s" : ""}.
          </span>
        </ContentContainer>
      );
    } else if (!this.state.workspaceId) {
      return (
        <ContentContainer>
          Finding your next (maybe suboptimal) workspace...
        </ContentContainer>
      );
    } else {
      const redirectQueryParams = `?isolated=true&active=true&experiment=${queryParams.experiment}`;
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

const FIND_NEXT_MAYBE_SUBOPTIMAL_WORKSPACE_MUTATION = gql`
  mutation findNextMaybeSuboptimalWorkspace($experimentId: String) {
    findNextMaybeSuboptimalWorkspace(experimentId: $experimentId) {
      id
    }
  }
`;

export const NextMaybeSuboptimalEpisodeShowPage = compose(
  graphql(FIND_NEXT_MAYBE_SUBOPTIMAL_WORKSPACE_MUTATION, { name: "findNextMaybeSuboptimalWorkspaceMutation" }),
)(NextMaybeSuboptimalEpisodeShowPagePresentational);
