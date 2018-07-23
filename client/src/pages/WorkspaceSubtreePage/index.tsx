import * as React from "react";

import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { WorkspaceCard } from "../../components/WorkspaceCard";

export class WorkspaceSubtreePage extends React.PureComponent<any, any> {
  public render() {
    const workspaceId = this.props.match.params.workspaceId;
    return (
      <div>
        <BlockHoverMenu>
          {workspaceId && (
            <WorkspaceCard
              isChild={false}
              parentPointers={[]}
              workspaceId={workspaceId}
            />
          )}
        </BlockHoverMenu>
      </div>
    );
  }
}
