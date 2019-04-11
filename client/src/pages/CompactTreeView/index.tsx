import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Helmet } from "react-helmet";
import { compose } from "recompose";
import { ContentContainer } from "../../components/ContentContainer";
import { CompactTreeGroup } from "./CompactTreeGroup";

export class CompactTreeViewPresentational extends React.PureComponent<any, any> {
  public render() {
    const hasDataBeenFetched = this.props.initialRootQuery.workspace;

    if (!hasDataBeenFetched) {
      return (
        <ContentContainer>
          <Helmet>
            <title>
              Compact Tree View - Mosaic
            </title>
          </Helmet>
          Loading data...
        </ContentContainer>
      );
    }

    const workspace = this.props.initialRootQuery.workspace;
    const isRootLevel = !workspace.parentId;

    if (!isRootLevel) {
      return (
        <ContentContainer>
          <Helmet>
            <title>
              Compact Tree View - Mosaic
            </title>
          </Helmet>
          Need to start with root level for compact tree view
        </ContentContainer>
      );
    }

    const isMalicious = workspace.isEligibleForMaliciousOracle;

    if (!isMalicious) {
      return (
        <ContentContainer>
          <Helmet>
            <title>
              Compact Tree View - Mosaic
            </title>
          </Helmet>
          Root level must be malicious for compact tree view
        </ContentContainer>
      );
    }

    return (
      <ContentContainer>
        <Helmet>
          <title>
            Compact Tree View - Mosaic
          </title>
        </Helmet>
        {
          workspace.childWorkspaces[0]
          ?
          <CompactTreeGroup
            availablePointers={workspace.connectedPointersOfSubtree}
            workspaceId={workspace.childWorkspaces[0].id}
          />
          :
          "Nothing to show yet..."
        }
      </ContentContainer>
    );
  }
}

export const INITIAL_ROOT_QUERY = gql`
  query initialRootQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      parentId
      isEligibleForMaliciousOracle
      connectedPointersOfSubtree
    childWorkspaces {
        id
        isEligibleForHonestOracle
      }
    }
  }
`;

export const CompactTreeView : any = compose(
  graphql(INITIAL_ROOT_QUERY, {
    name: "initialRootQuery",
    options: (props: any) => ({
      variables: {
        workspaceId: props.match.params.workspaceId,
      }
    }),
  })
)(CompactTreeViewPresentational);
