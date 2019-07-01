import * as React from "react";
import { Helmet } from "react-helmet";
import { ContentContainer } from "../../components/ContentContainer";
import { WorkspaceHistory } from "../../components/WorkspaceHistory";

export class WorkspaceHistoryView extends React.PureComponent<any, any> {
  public render() {
    return (
      <ContentContainer>
        <Helmet>
          <title>Workspace History View - Mosaic</title>
        </Helmet>
        <WorkspaceHistory workspaceId={this.props.match.params.workspaceId} />
      </ContentContainer>
    );
  }
}
