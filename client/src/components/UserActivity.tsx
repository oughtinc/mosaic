import gql from "graphql-tag";
import styled from "styled-components";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { RootBlock } from "../pages/RootWorkspacePage/RootBlock";
import { Auth } from "../auth";

import { ReadableDuration } from "./ReadableDuration";

import {
  blockBorderAndBoxShadow,
  blockBodyCSS,
} from "../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

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
          <div
            style={{
              paddingBottom: "15px",
              paddingLeft: "120px"
            }}
          >
            <span
              style={{ color: "#11aa11", fontSize: "24px" }}
            >
              {this.props.userActivityQuery.userActivity.assignments.length}
            </span>
            {" "}workspace{this.props.userActivityQuery.userActivity.assignments.length !== 1 ? "s" : ""} visited
            <br />
            <ReadableDuration
              durationInMs={this.props.userActivityQuery.userActivity.assignments.reduce((acc: number, val) => { return acc + Number(val.howLongDidAssignmentLast); }, 0) / this.props.userActivityQuery.userActivity.assignments.length}
              numberFontSize="24px"
              style={{
                color: "#11aa11",
                fontSize: "16px"
              }}
            />
            {" "}average time spent on each workspace
          </div>
        }
        {
          !this.props.userActivityQuery.loading && 
          this.props.userActivityQuery.userActivity.assignments
            .map((elem, i, arr) => arr[arr.length - 1 - i]) // hacky immutable reverse :)
            .map(assignment => {
              const workspace = assignment.workspace;
              const question = workspaceToBlock(workspace, "QUESTION"); 
              return (
                <div
                  key={workspace.id} 
                  style={{
                    alignItems: "center",
                    display: "flex",
                    marginBottom: "30px",
                    maxWidth: "500px",
                  }}
                >
                  <div
                    style={{
                      paddingRight: "10px",
                      textAlign: "right",
                      width: "120px"
                    }}
                  >
                    <ReadableDuration
                      durationInMs={assignment.howLongDidAssignmentLast}
                      numberFontSize="18px"
                    />
                  </div>
                  <div
                    style={{
                      flexGrow: 1,
                      position: "relative"
                    }}
                  >
                    <BlockContainer>
                      <BlockBody>
                        <RootBlock 
                          block={question} 
                          shouldTurnExportsIntoImports={true}
                          style={{ maxWidth: "358px" }}
                        />   
                      </BlockBody>
                    </BlockContainer>
                    <div
                      style={{
                        bottom: "-20px",
                        color: "#888",
                        left: "10px",
                        position: "absolute",
                      }}
                    >
                      <span style={{ color: "#666" }}>{assignment.totalUsersWhoHaveWorkedOnWorkspace - 1}</span>
                      {" "}
                      other user
                      {assignment.totalUsersWhoHaveWorkedOnWorkspace - 1 !== 1 ? "s" : ""}{" "}
                      {assignment.totalUsersWhoHaveWorkedOnWorkspace - 1 !== 1 ? "have" : "has"}{" "}
                      worked on this workspace
                    </div>
                  </div>
                </div>
              );
          })
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
