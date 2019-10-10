import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { ContentContainer } from "../components/ContentContainer";
import { VERY_DARK_BLUE, VERY_LIGHT_BLUE } from "../styles";
import { Auth } from "../auth";

import { getExperimentIdOrSerialIdFromQueryParams } from "../helpers/getExperimentIdOrSerialIdFromQueryParams";

const NOTIFICATION_NOT_REGISTERED = 1;
const NOTIFICATION_REGISTRATION_PENDING = 2;
const NOTIFICATION_REGISTERED = 3;
const NOTIFICATION_REGISTRATION_ERRORED = 4;

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

const RegisterForEmailNotification = ({ onClick, registrationStatus }) => (
  <div
    style={{
      backgroundColor: VERY_LIGHT_BLUE,
      border: `1px solid ${VERY_DARK_BLUE}`,
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      marginBottom: "10px",
      marginRight: "10px",
      padding: "20px",
      textAlign: "justify",
    }}
  >
    <span>
      You may choose instead to receive an e-mail notification when a workspace
      becomes available for you in this experiment.
    </span>
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <Button
        bsStyle="primary"
        onClick={onClick}
        disabled={registrationStatus !== NOTIFICATION_NOT_REGISTERED}
      >
        {registrationStatus === NOTIFICATION_NOT_REGISTERED &&
          "Register for e-mail notification ✉️"}
        {registrationStatus === NOTIFICATION_REGISTERED && "You've registered!"}
        {registrationStatus === NOTIFICATION_REGISTRATION_PENDING &&
          "Registering…"}
        {registrationStatus === NOTIFICATION_REGISTRATION_ERRORED &&
          "Error! Unable to successfully register"}
      </Button>
    </div>
  </div>
);

export class NextEpisodeShowPagePresentational extends React.Component<
  any,
  any
> {
  public constructor(props: any) {
    super(props);
    this.state = {
      oracleSchedulingFailed: false,
      oracleSchedulingErrored: false,
      oracleSchedulingErrorMessage: null,
      refreshCountdown: 10,
      workspaceId: undefined,
      isCountingDown: false,
      countdownInterval: null,
      notificationRegistrationState: this.props.isUserRegisteredForNotifications
        ? NOTIFICATION_REGISTERED
        : NOTIFICATION_NOT_REGISTERED,
    };
    this.registerForNotification = this.registerForNotification.bind(this);
  }

  public async componentDidMount() {
    let response,
      oracleSchedulingFailed,
      oracleSchedulingErrored,
      oracleSchedulingErrorMessage;

    const experimentId = getExperimentIdOrSerialIdFromQueryParams(
      window.location.search,
    );

    try {
      response = await this.props.findNextWorkspaceMutation({
        variables: {
          experimentId,
        },
      });
    } catch (e) {
      oracleSchedulingErrored =
        e.message !== "GraphQL error: No workspaces found. Please try later.";
      oracleSchedulingErrorMessage = e.message;

      oracleSchedulingFailed = true;
    }

    if (window.heap && oracleSchedulingFailed) {
      window.heap.track("No workspace available", {
        experimentId,
        acceptSuboptimalWorkspace: false,
      });
      if (oracleSchedulingErrored) {
        window.heap.track("Scheduling Errored", {
          experimentId,
          oracleSchedulingErrorMessage,
        });
      }
    }

    if (oracleSchedulingFailed) {
      if (oracleSchedulingErrored) {
        this.setState({
          oracleSchedulingFailed,
          oracleSchedulingErrored,
          oracleSchedulingErrorMessage,
        });
      } else {
        this.setState({ oracleSchedulingFailed });
        this.startCountingDown();
      }
    } else if (response) {
      const workspaceId = response.data.findNextWorkspace.serialId;
      this.setState({ workspaceId });
    }
  }

  public componentWillUnmount() {
    this.stopCountingDown();
  }

  public render() {
    const experimentId = getExperimentIdOrSerialIdFromQueryParams(
      window.location.search,
    );

    if (this.state.refreshCountdown === 0) {
      location.reload();
    }

    if (this.state.oracleSchedulingErrored) {
      return (
        <ContentContainer>
          <Helmet>
            <title>No Assignment Found - Mosaic</title>
          </Helmet>
          <RedExclamation />
          <span style={{ color: "black" }}>
            The scheduler ran into an error while attempting to find you a
            workspace. Please let us know!
          </span>
          <div />
          <span style={{ color: "darkRed" }}>
            {this.state.oracleSchedulingErrorMessage}
          </span>
        </ContentContainer>
      );
    } else if (this.state.oracleSchedulingFailed) {
      return (
        <ContentContainer>
          <Helmet>
            <title>No Assignment Found - Mosaic</title>
          </Helmet>
          <RedExclamation />
          <span style={{ color: "darkRed" }}>
            There is no eligible workspace at this time. Please wait and refresh
            this page to try again.
            {this.state.isCountingDown && (
              <React.Fragment>
                {" "}
                Automatically refreshing in {this.state.refreshCountdown} second
                {this.state.refreshCountdown !== 1 ? "s" : ""}.
              </React.Fragment>
            )}
          </span>

          <div
            style={{
              display: "flex",
              marginLeft: "20px",
              marginTop: "50px",
            }}
          >
            <RegisterForEmailNotification
              onClick={this.registerForNotification}
              registrationStatus={this.state.notificationRegistrationState}
            />
          </div>
        </ContentContainer>
      );
    } else if (!this.state.workspaceId) {
      return (
        <ContentContainer>
          <Helmet>
            <title>Finding Next Assignment - Mosaic</title>
          </Helmet>
          Finding your next workspace...
        </ContentContainer>
      );
    } else {
      const redirectQueryParams = `?e=${experimentId}`;
      window.location.href = `${window.location.origin}/w/${
        this.state.workspaceId
      }${redirectQueryParams}`;
      return null;
    }
  }

  private startCountingDown() {
    if (this.state.isCountingDown) {
      return;
    }

    const isCountingDown = true;
    const countdownInterval = setInterval(
      () =>
        this.setState({
          refreshCountdown: Math.max(0, this.state.refreshCountdown - 1),
        }),
      1000,
    );

    this.setState({ isCountingDown, countdownInterval });
  }

  private stopCountingDown() {
    if (this.state.isCountingDown) {
      clearInterval(this.state.countdownInterval);
      this.setState({
        isCountingDown: false,
        countdownInterval: null,
      });
    }
  }

  private async registerForNotification() {
    this.setState({
      notificationRegistrationState: NOTIFICATION_REGISTRATION_PENDING,
    });

    const experimentId = getExperimentIdOrSerialIdFromQueryParams(
      window.location.search,
    );

    try {
      await this.props.notifyOnNextWorkspaceMutation({
        variables: {
          experimentId,
        },
      });
      this.setState({ notificationRegistrationState: NOTIFICATION_REGISTERED });
    } catch {
      this.setState({
        notificationRegistrationState: NOTIFICATION_REGISTRATION_ERRORED,
      });
    }
  }
}

export class NextEpisodeShowPageContainer extends React.Component<any, any> {
  public render() {
    if (!Auth.isAuthenticated()) {
      return (
        <ContentContainer>
          Please log in to access your next workspace.
        </ContentContainer>
      );
    }
    if (
      this.props.isUserRegisteredForNotificationsQuery
        .isUserRegisteredForNotifications !== undefined
    ) {
      return (
        <NextEpisodeShowPagePresentational
          findNextWorkspaceMutation={this.props.findNextWorkspaceMutation}
          isUserRegisteredForNotifications={
            this.props.isUserRegisteredForNotificationsQuery
              .isUserRegisteredForNotifications
          }
          notifyOnNextWorkspaceMutation={
            this.props.notifyOnNextWorkspaceMutation
          }
          oracleModeQuery={this.props.oracleModeQuery}
        />
      );
    }

    return <div />;
  }
}

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const IS_USER_REGISTERED_FOR_NOTIFICATIONS = gql`
  query isUserRegisteredForNotificationsQuery(
    $experimentId: String
    $userId: String
  ) {
    isUserRegisteredForNotifications(
      experimentId: $experimentId
      userId: $userId
    )
  }
`;

const FIND_NEXT_WORKSPACE_MUTATION = gql`
  mutation findNextWorkspace($experimentId: String) {
    findNextWorkspace(experimentId: $experimentId) {
      serialId
    }
  }
`;

const NOTIFY_NEXT_WORKSPACE_MUTATION = gql`
  mutation notifyOnNextWorkspace($experimentId: String) {
    notifyOnNextWorkspace(experimentId: $experimentId)
  }
`;

export const NextEpisodeShowPage = compose(
  graphql(FIND_NEXT_WORKSPACE_MUTATION, { name: "findNextWorkspaceMutation" }),
  graphql(NOTIFY_NEXT_WORKSPACE_MUTATION, {
    name: "notifyOnNextWorkspaceMutation",
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
  withRouter,
  graphql(IS_USER_REGISTERED_FOR_NOTIFICATIONS, {
    name: "isUserRegisteredForNotificationsQuery",
    options: (props: any) => ({
      variables: {
        experimentId:
          getExperimentIdOrSerialIdFromQueryParams(window.location.search) ||
          getExperimentIdOrSerialIdFromQueryParams(
            props.history.location.search,
          ),
        userId: Auth.userId(),
      },
    }),
  }),
)(NextEpisodeShowPageContainer);
