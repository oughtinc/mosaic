import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

export class WorkspaceHistoryPresentational extends React.PureComponent<
  any,
  any
> {
  public render() {
    console.log(this.props);

    return <div>{JSON.stringify(this.props)}</div>;
  }
}

const WORKSPACE_HISTORY = gql`
  query workspaceHistoryQuery($id: String) {
    workspace(id: $id) {
      id
      assignments {
        id
      }
    }
  }
`;

export const WorkspaceHistory: any = compose(
  graphql(WORKSPACE_HISTORY, {
    name: "workspaceHistoryQuery",
    options: (props: any) => ({
      variables: {
        id: props.workspaceId,
      },
    }),
  }),
)(WorkspaceHistoryPresentational);
