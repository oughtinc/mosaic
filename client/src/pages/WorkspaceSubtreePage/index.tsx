import * as React from "react";
import { Button } from "react-bootstrap";
import { Helmet } from "react-helmet";

import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { ContentContainer } from "../../components/ContentContainer";
import { WorkspaceCard } from "../../components/WorkspaceCard";
import { getIsTreeExpandedFromQueryParams } from "../../helpers/getIsTreeExpandedFromQueryParams";

export class WorkspaceSubtreePage extends React.PureComponent<any, any> {
  public render() {
    const isExpanded = getIsTreeExpandedFromQueryParams(window.location.search);
    const workspaceId = this.props.match.params.workspaceId;

    return (
      <ContentContainer>
        <Helmet>
          <title>Tree View {workspaceId.slice(0, 7)} - Mosaic</title>
        </Helmet>
        {isExpanded ? (
          <Button
            onClick={() => {
              const { origin, pathname } = window.location;
              window.location.href = `${origin}${pathname}`;
            }}
            style={{ marginBottom: "20px" }}
          >
            Collapse All
          </Button>
        ) : (
          <Button
            onClick={() => {
              const { origin, pathname } = window.location;
              window.location.href = `${origin}${pathname}?expanded=true`;
            }}
            style={{ marginBottom: "20px" }}
          >
            Expand All
          </Button>
        )}
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
