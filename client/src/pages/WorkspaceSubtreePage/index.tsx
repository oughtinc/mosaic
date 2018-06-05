import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import * as React from "react";
import { WorkspaceCard } from "../../components/WorkspaceCard";

export class WorkspaceSubtreePage extends React.PureComponent<any, any> {
    public render() {
        const workspaceId = this.props.match.params.workspaceId;
        return (
            <div>
                <BlockHoverMenu>
                    {workspaceId &&
                        <WorkspaceCard
                            workspaceId={workspaceId}
                        />
                    }
                </BlockHoverMenu>
            </div>
        );
    }
}
