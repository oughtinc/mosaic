import gql from "graphql-tag";
import * as React from "react";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { parse as parseQueryString } from "query-string";
import * as _ from "lodash";
import {
  ROOT_WORKSPACE_SUBTREE_QUERY,
  CHILD_WORKSPACE_SUBTREE_QUERY,
  UPDATE_WORKSPACE,
} from "../../graphqlQueries";

import { WorkspaceCardPresentational } from "./WorkspaceCard";

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const SUBTREE_TIME_SPENT_QUERY = gql`
query subtreeTimeSpentQuery($id: String!) {
  subtreeTimeSpent(id: $id)
}
`;

const MARK_WORKSPACE_STALE_FOR_USER_MUTATION = gql`
  mutation markWorkspaceStaleForUser($userId: String, $workspaceId: String) {
    markWorkspaceStaleForUser(userId: $userId, workspaceId: $workspaceId)
  }
`;

const EJECT_USER_FROM_CURRENT_WORKSPACE_MUTATION = gql`
  mutation ejectUserFromCurrentWorkspace($userId: String, $workspaceId: String) {
    ejectUserFromCurrentWorkspace(userId: $userId, workspaceId: $workspaceId)
  }
`;

const LoadingMsg = ({ isTopLevelOfCurrentTree }) => {
  return (
    <div>
      {
        isTopLevelOfCurrentTree
        ?
        "Loading... This may take some time for complex trees."
        :
        "Loading..."
      }
    </div>
  );
};

const optionsForTopLevel = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "network-only",
  variables: { workspaceId },
});

const optionsForNested = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "network-only",
  variables: { workspaceId },
});

const optionsForSubtreeTimeSpentQuery = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "cache-and-network",
  variables: { id: workspaceId },
});

export class WorkspaceCardContainer extends React.PureComponent<any, any> {
  public render() {
    const queryParams = parseQueryString(window.location.search);
    const { expanded, expand = "" } = queryParams;
    const expandIds = expand.split(",").filter(param => param.length > 0);
    const isExpanded = expanded === "true" || _.includes(expandIds, this.props.workspaceId);

    if (
      this.props.oracleModeQuery.oracleMode !== undefined
      &&
      this.props.subtreeQuery.workspace !== undefined
    ) {
      return (
        <WorkspaceCardPresentational
          activeWorkspaceId={queryParams.activeWorkspace}
          ejectUserFromCurrentWorkspace={async ({ userId, workspaceId }) => await this.props.ejectUserFromCurrentWorkspaceMutation({
            variables: {
              userId,
              workspaceId,
            },
          })}
          isExpanded={isExpanded}
          isTopLevelOfCurrentTree={this.props.isTopLevelOfCurrentTree}
          oracleModeQuery={this.props.oracleModeQuery}
          markWorkspaceStaleForUser={({ userId, workspaceId }) => this.props.markWorkspaceStaleForUserMutation({
            variables: {
              userId,
              workspaceId,
            }
          })}
          parentPointers={this.props.parentPointers}
          subtreeQuery={this.props.subtreeQuery}
          subtreeTimeSpentData={this.props.subtreeTimeSpentData}
          subtreeTimeSpentQuery={this.props.subtreeTimeSpentQuery}
          updateWorkspace={this.props.updateWorkspace}
          workspaceId={this.props.workspaceId}
        />
      );
    } else {
      return <LoadingMsg isTopLevelOfCurrentTree={this.props.isTopLevelOfCurrentTree} />;
    }
  }

}

export const WorkspaceCard: any = compose(
  graphql(ROOT_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForTopLevel,
    skip: ({ isTopLevelOfCurrentTree }) => !isTopLevelOfCurrentTree,
  }),
  graphql(CHILD_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForNested,
    skip: ({ isTopLevelOfCurrentTree }) => isTopLevelOfCurrentTree,
  }),
  graphql(SUBTREE_TIME_SPENT_QUERY, {
    name: "subtreeTimeSpentQuery",
    options: optionsForSubtreeTimeSpentQuery,
    skip: ({ isTopLevelOfCurrentTree }) => !isTopLevelOfCurrentTree,
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
  graphql(UPDATE_WORKSPACE, {
    name: "updateWorkspace",
    options: {
      refetchQueries: [ "subtreeQuery" ],
    }
  }),
  graphql(MARK_WORKSPACE_STALE_FOR_USER_MUTATION, {
    name: "markWorkspaceStaleForUserMutation",
  }),
  graphql(EJECT_USER_FROM_CURRENT_WORKSPACE_MUTATION, {
    name: "ejectUserFromCurrentWorkspaceMutation",
  }),
)(WorkspaceCardContainer);
