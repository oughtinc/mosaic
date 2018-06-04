import { compose } from "recompose";
import { graphql } from "react-apollo";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import * as React from "react";
import _ = require("lodash");
import { WorkspaceCard } from "../../components/WorkspaceCard";
import { WORKSPACE_SUBTREE_QUERY } from "../../graphqlQueries";

export class WorkspaceSubtreePagePresentational extends React.Component<any, any> {
    public render() {
        const workspaces = _.get(
            this.props, "workspaceSubtreeWorkspaces.subtreeWorkspaces"
        ) || [];
        const availablePointers: any = _
            .chain(workspaces)
            .map((w: any) => w.connectedPointers)
            .flatten()
            .uniqBy((p: any) => p.data.pointerId)
            .value();
        const rootWorkspace = workspaces.find((w) =>
            w.id === this.props.match.params.workspaceId);
        return (
            <div>
                <BlockHoverMenu>
                    {rootWorkspace &&
                        <WorkspaceCard
                            workspace={rootWorkspace}
                            availablePointers={availablePointers}
                            workspaces={workspaces}
                        />
                    }
                </BlockHoverMenu>
            </div>
        );
    }
}

const options: any = ({ match }) => ({
    variables: { workspaceId: match.params.workspaceId },
});

export const WorkspaceSubtreePage = compose(
    graphql(
        WORKSPACE_SUBTREE_QUERY,
        { name: "workspaceSubtreeWorkspaces", options }
    ),
)(WorkspaceSubtreePagePresentational);
