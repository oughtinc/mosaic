import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Auth } from "../../auth";

import { UserActivitySummary } from "./UserActivitySummary";
import { UserActivityWorkspaceReports } from "./UserActivityWorkspaceReports";

export class UserActivityPresentational extends React.Component<any, any> {
  public render() {
    const primaryAssignments =
      this.props.userActivityQuery.userActivity &&
      this.props.userActivityQuery.userActivity.assignments.filter(a => {
        return a.workspace.rootWorkspace.tree.experiments.some(
          e => e.eligibilityRank === 1,
        );
      });

    const fallbackAssignments =
      this.props.userActivityQuery.userActivity &&
      this.props.userActivityQuery.userActivity.assignments.filter(a => {
        return !a.workspace.rootWorkspace.tree.experiments.some(
          e => e.eligibilityRank === 1,
        );
      });

    return (
      <div
        style={{
          backgroundColor: "#f4f4f4",
          border: "1px solid #ddd",
          margin: "50px auto 0",
          maxWidth: "600px",
          paddingBottom: "15px",
        }}
      >
        <h3 style={{ textAlign: "center" }}>Your Activity</h3>
        {!this.props.userActivityQuery.loading && (
          <div>
            <UserActivitySummary
              averageTimeInMsSpentOnEachWorkspace={
                this.props.userActivityQuery.userActivity.assignments.reduce(
                  (acc: number, val) => {
                    return acc + Number(val.howLongDidAssignmentLast);
                  },
                  0,
                ) / this.props.userActivityQuery.userActivity.assignments.length
              }
              howManyPrimaryWorkspacesHasUserWorkedOn={
                primaryAssignments.length
              }
              howManyFallbackWorkspacesHasUserWorkedOn={
                fallbackAssignments.length
              }
            />
            <UserActivityWorkspaceReports
              assignments={
                this.props.userActivityQuery.userActivity.assignments
              }
            />
          </div>
        )}
      </div>
    );
  }
}

const USER_ACTIVITY_QUERY = gql`
  query userActivityQuery($experimentId: String, $userId: String) {
    userActivity(experimentId: $experimentId, userId: $userId) {
      assignments {
        howLongDidAssignmentLast
        startAtTimestamp
        totalUsersWhoHaveWorkedOnWorkspace
        workspace {
          id
          blocks {
            type
            value
          }
          rootWorkspace {
            id
            tree {
              id
              experiments {
                id
                eligibilityRank
              }
            }
          }
        }
      }
    }
  }
`;

const options = ({ experimentId }) => ({
  variables: {
    experimentId,
    userId: Auth.userId(),
  },
});

export const UserActivity: any = compose(
  graphql(USER_ACTIVITY_QUERY, {
    name: "userActivityQuery",
    options,
  }),
)(UserActivityPresentational);
