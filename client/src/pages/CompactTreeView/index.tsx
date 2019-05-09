import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { compose } from "recompose";
import { parse as parseQueryString } from "query-string";
import { ContentContainer } from "../../components/ContentContainer";
import { CompactTreeGroupContainer as V1CompactTreeGroupContainer } from "./V1CompactTreeGroupContainer";
import { CompactTreeGroupContainer as V2CompactTreeGroupContainer } from "./V2CompactTreeGroupContainer";
import { getVersionOfTree } from "./helpers/getVersionOfTree";

export class CompactTreeViewContainer extends React.PureComponent<any, any> {
  public render() {
    return (
      <ContentContainer>
        <Helmet>
          <title>Compact Tree View - Mosaic</title>
        </Helmet>
        {parseQueryString(window.location.search).expanded === "true" ? (
          <Button
            onClick={() => {
              const { origin, pathname } = window.location;
              window.location.href = `${origin}${pathname}`;
            }}
          >
            Collapse All
          </Button>
        ) : (
          <Button
            onClick={() => {
              const { origin, pathname } = window.location;
              window.location.href = `${origin}${pathname}?expanded=true`;
            }}
          >
            Expand All
          </Button>
        )}
        <div>{this.props.children}</div>
      </ContentContainer>
    );
  }
}

export class CompactTreeViewPresentational extends React.PureComponent<
  any,
  any
> {
  public render() {
    const hasDataBeenFetched = this.props.initialRootQuery.workspace;

    if (!hasDataBeenFetched) {
      return (
        <CompactTreeViewContainer>
          <div style={{ marginTop: "20px" }}>Loading...</div>
        </CompactTreeViewContainer>
      );
    }

    const workspace = this.props.initialRootQuery.workspace;
    const isRootLevel = !workspace.parentId;

    if (isRootLevel && !workspace.childWorkspaces[0]) {
      return (
        <CompactTreeViewContainer>
          <div style={{ marginTop: "20px" }}>Nothing to show yet...</div>
        </CompactTreeViewContainer>
      );
    }

    return (
      <CompactTreeViewContainer>
        {getVersionOfTree(workspace) === "V1" ? (
          <div key={workspace.id} style={{ marginBottom: "10px" }}>
            <V1CompactTreeGroupContainer
              availablePointers={workspace.connectedPointersOfSubtree}
              workspaceId={
                isRootLevel ? workspace.childWorkspaces[0].id : workspace.id
              }
            />
          </div>
        ) : (
          <V2CompactTreeGroupContainer
            availablePointers={workspace.connectedPointersOfSubtree}
            workspaceId={
              isRootLevel ? workspace.childWorkspaces[0].id : workspace.id
            }
          />
        )}
      </CompactTreeViewContainer>
    );
  }
}

export const INITIAL_ROOT_QUERY = gql`
  query initialRootQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      createdAt
      parentId
      isEligibleForHonestOracle
      isEligibleForMaliciousOracle
      isRequestingLazyUnlock
      connectedPointersOfSubtree
      childWorkspaces {
        id
        isEligibleForHonestOracle
      }
    }
  }
`;

export const CompactTreeView: any = compose(
  graphql(INITIAL_ROOT_QUERY, {
    name: "initialRootQuery",
    options: (props: any) => ({
      variables: {
        workspaceId: props.match.params.workspaceId,
      },
    }),
  }),
)(CompactTreeViewPresentational);
