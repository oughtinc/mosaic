import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { Helmet } from "react-helmet";
import { compose } from "recompose";
import { BlockEditor } from "../../components/BlockEditor";
import { ContentContainer } from "../../components/ContentContainer";
import { Snapshot } from "./Snapshot";

function getAllExportIdsFromNode(node: any) {
  const exportIds: any = [];

  if (node.type && node.type === "pointerExport") {
    exportIds.push(node.data.pointerId);
  }

  if (node.nodes) {
    for (const childNode of node.nodes) {
      console.log("childNode", childNode);
      exportIds.push(...getAllExportIdsFromNode(childNode));
    }
  }

  return exportIds;
}

function blocksToExportIds(blocks) {
  const exportIds: any = [];

  for (const block of blocks) {
    console.log("block", block);
    exportIds.push(...getAllExportIdsFromNode(block.value.document));
  }

  return exportIds;
}

export class SnapshotViewContainer extends React.PureComponent<any, any> {
  public render() {
    return (
      <ContentContainer>
        <Helmet>
          <title>Snapshot View - Mosaic</title>
        </Helmet>
        {this.props.snapshotQuery.snapshot ? (
          <Snapshot snapshot={this.props.snapshotQuery.snapshot.snapshot} />
        ) : (
          "Loading... "
        )}
      </ContentContainer>
    );
  }
}

export const SNAPSHOT_QUERY = gql`
  query snapshotQuery($snapshotId: String!) {
    snapshot(id: $snapshotId) {
      id
      user {
        id
      }
      workspace {
        id
      }
      workspaceId
      snapshot
    }
  }
`;

export const SnapshotView: any = compose(
  graphql(SNAPSHOT_QUERY, {
    name: "snapshotQuery",
    options: (props: any) => ({
      variables: {
        snapshotId: props.match.params.snapshotId,
      },
    }),
  }),
)(SnapshotViewContainer);
