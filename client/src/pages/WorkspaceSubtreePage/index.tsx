import * as React from "react";
import { Button } from "react-bootstrap";

import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { ContentContainer } from "../../components/ContentContainer";
import { WorkspaceCard } from "../../components/WorkspaceCard";

export class WorkspaceSubtreePage extends React.PureComponent<any, any> {
  public render() {
    const workspaceId = this.props.match.params.workspaceId;
    return (
      <ContentContainer>
        <Button
          onClick={() => {
            const { origin, pathname } = window.location;
            window.location.href = `${origin}${pathname}?expanded=true`;
          }}
          style={{ marginBottom: "20px" }}
        >
          Expand All
        </Button>
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
