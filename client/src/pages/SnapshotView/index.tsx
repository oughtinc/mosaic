import * as React from "react";
import { Helmet } from "react-helmet";
import { ContentContainer } from "../../components/ContentContainer";
import { Assignment } from "../../components/Assignment";

export class AssignmentView extends React.PureComponent<any, any> {
  public render() {
    return (
      <ContentContainer>
        <Helmet>
          <title>Assignment View - Mosaic</title>
        </Helmet>
        <Assignment assignmentId={this.props.match.params.assignmentId} />
      </ContentContainer>
    );
  }
}
