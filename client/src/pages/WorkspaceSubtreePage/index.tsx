import * as React from "react";

import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { ContentContainer } from "../../components/ContentContainer";
import { WorkspaceCard } from "../../components/WorkspaceCard";

export class WorkspaceSubtreePage extends React.PureComponent<any, any> {
  public render() {
    const workspaceId = this.props.match.params.workspaceId;
    return (
      <ContentContainer>
        <BlockHoverMenu>
          {workspaceId && (
            <WorkspaceCard
              isTopLevelOfCurrentTree={true}
              parentPointers={[]}
              workspaceId={workspaceId}
            />
          )}
        </BlockHoverMenu>
      </ContentContainer>
    );
  }
}
