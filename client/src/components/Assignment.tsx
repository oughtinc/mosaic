import gql from "graphql-tag";
import * as _ from "lodash";
import { DateTime } from "luxon";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { Snapshot } from "./Snapshot";

import { secondsToDurationString } from "./helpers/secondsToDurationString";

export class AssignmentPresentational extends React.PureComponent<any, any> {
  public render() {
    if (this.props.assignmentQuery.assignment) {
      const assignment = this.props.assignmentQuery.assignment;

      return (
        <div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
              padding: "10px",
            }}
          >
            <div>
              <img
                src={assignment.user.pictureURL}
                style={{
                  borderRadius: "30px",
                  boxShadow: "1px 1px 1px 1px #888",
                  height: "60px",
                  marginBottom: "8px",
                  marginRight: "8px",
                  width: "60px",
                }}
              />
            </div>
            <div
              style={{
                alignItems: "flex-start",
                display: "flex",
                color: "#777",
                flexDirection: "column",
                fontSize: "16px",
                justifyContent: "center",
                marginLeft: "10px",
              }}
            >
              {assignment.user.givenName
                ? `${assignment.user.givenName} ${assignment.user.familyName}`
                : assignment.user.email || assignment.user.id}
              <br />
              {DateTime.fromMillis(
                Number(assignment.startAtTimestamp),
              ).toLocaleString(DateTime.DATETIME_SHORT)}
              <br />
              {secondsToDurationString(
                Math.round(
                  (Number(assignment.endAtTimestamp) -
                    Number(assignment.startAtTimestamp)) /
                    1000,
                ),
                true,
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {_.sortBy(this.props.assignmentQuery.assignment.snapshots, s =>
              Date.parse(s.createdAt),
            )
              .filter((s, i, arr) => {
                if (s.actionType === "UNLOAD") {
                  if (arr.filter(s2 => s2.actionType !== "UNLOAD").length > 1) {
                    return false;
                  }

                  if (i > 1) {
                    return false;
                  }

                  return true;
                }
                return true;
              })
              .map((snapshot, i) => (
                <div key={i} style={{ width: "400px" }}>
                  <Snapshot
                    snapshot={snapshot}
                    isOracleWorkspace={
                      assignment.workspace.isEligibleForHonestOracle ||
                      assignment.workspace.isEligibleForMaliciousOracle
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

const ASSINGMENT_QUERY = gql`
  query assignmentQuery($id: String) {
    assignment(id: $id) {
      id
      user {
        id
        email
        givenName
        familyName
        pictureURL
      }
      workspace {
        isEligibleForHonestOracle
        isEligibleForMaliciousOracle
      }
      endAtTimestamp
      startAtTimestamp
      snapshots {
        id
        createdAt
        actionType
        snapshot
      }
    }
  }
`;

export const Assignment: any = compose(
  graphql(ASSINGMENT_QUERY, {
    name: "assignmentQuery",
    options: (props: any) => ({
      variables: {
        id: props.assignmentId,
      },
    }),
  }),
)(AssignmentPresentational);
