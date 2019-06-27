import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Snapshot } from "./Snapshot";

export class AssignmentPresentational extends React.PureComponent<any, any> {
  public render() {
    console.log(this.props);

    return this.props.assignmentQuery.assignment ? (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {this.props.assignmentQuery.assignment.snapshots.map(snapshot => (
          <div style={{ width: "300px" }}>
            <h2>{snapshot.actionType}</h2>
            <Snapshot snapshot={snapshot.snapshot} />
          </div>
        ))}
      </div>
    ) : null;
  }
}

const ASSINGMENT_QUERY = gql`
  query assignmentQuery($id: String) {
    assignment(id: $id) {
      id
      snapshots {
        id
        actionType
        userId
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
