import gql from "graphql-tag";
import styled from "styled-components";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Auth } from "../../auth";

import { UserActivitySummary } from "./UserActivitySummary";
import { UserActivityWorkspaceReports } from "./UserActivityWorkspaceReports";

export class UserActivityPresentational extends React.Component<any, any> {
  public render() {
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
        {
          !this.props.userActivityQuery.loading && 
          <div>
            <UserActivitySummary
              averageTimeInMsSpentOnEachWorkspace={this.props.userActivityQuery.userActivity.assignments.reduce((acc: number, val) => { return acc + Number(val.howLongDidAssignmentLast); }, 0) / this.props.userActivityQuery.userActivity.assignments.length}
              howManyWorkspacesHasUserWorkedOn={this.props.userActivityQuery.userActivity.assignments.length}
            />
            <UserActivityWorkspaceReports 
              assignments={this.props.userActivityQuery.userActivity.assignments}
            />
          </div>
        }
      </div>
    );
  }
}

const USER_ACTIVITY_QUERY = gql`
query userActivityQuery($userId: String) {
  userActivity(userId: $userId) {
    assignments {
      howLongDidAssignmentLast
      totalUsersWhoHaveWorkedOnWorkspace
      workspace {
        id
        blocks {
          type
          value
        }
      }
    }
  }
}`;

export const UserActivity = compose(
  graphql(USER_ACTIVITY_QUERY, { 
    name: "userActivityQuery",
    options: {
      variables: {
        userId: Auth.userId(),
      }
    },
  }),
)(UserActivityPresentational);
