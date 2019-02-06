import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { ContentContainer } from  "../../components/ContentContainer";

export class ExperimentShowPagePresentational extends React.Component<any, any> {
  public render() {
    return (
      <div>
        <ContentContainer>
         {JSON.stringify(this.props)}
        </ContentContainer>
      </div>
    );
  }
}

export const ExperimentShowPage = ExperimentShowPagePresentational;
