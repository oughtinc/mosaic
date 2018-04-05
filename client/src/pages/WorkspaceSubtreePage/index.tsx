import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import * as React from "react";
import _ = require("lodash");
import { WorkspaceCard } from "../../components/WorkspaceCard";

const WORKSPACES_QUERY = gql`
query workspaceSubtree($workspaceId: String!){
    subtreeWorkspaces(workspaceId:$workspaceId){
       id
       childWorkspaceOrder
       connectedPointers
       blocks{
         id
         value
         type
       }
     }
  }
`;

export class WorkspaceSubtreePagePresentational extends React.Component<any, any> {
    public render() {
        const workspaces = _.get(this.props, "workspaceSubtreeWorkspaces.subtreeWorkspaces") || [];
        const availablePointers: any = _
          .chain(workspaces)
          .map((w: any) => w.connectedPointers)
          .flatten()
          .uniqBy((p: any) => p.data.pointerId)
          .value();
        const rootWorkspace = workspaces.find((w) => w.id === this.props.match.params.workspaceId);
        return rootWorkspace ?
            <WorkspaceCard workspace={rootWorkspace} availablePointers={availablePointers} workspaces={workspaces} />
            : null;
    }
}

const options: any = ({ match }) => ({
    variables: { workspaceId: match.params.workspaceId },
});

export const WorkspaceSubtreePage = compose(
    graphql(WORKSPACES_QUERY, { name: "workspaceSubtreeWorkspaces", options }),
)(WorkspaceSubtreePagePresentational);
