import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { compose } from "recompose";

import { ContentContainer } from  "../../components/ContentContainer";
import { Auth } from "../../auth";
import { MetaDataEditor } from "../../components/MetadataEditor";

interface NextWorkspaceBtnProps {
  bsStyle: string;
  experimentId: string;
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({ bsStyle, experimentId, label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to={`/next?experiment=${experimentId}`}>
      <Button bsSize="small" bsStyle={bsStyle}>{label} »</Button>
    </Link>
  );
};

export class ExperimentShowPagePresentational extends React.Component<any, any> {
  public render() {
    const experimentId = this.props.match.params.experimentId;
    return (
      <div>
        <ContentContainer>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            {
              this.props.experimentQuery.experiment
              &&
              this.props.experimentQuery.experiment.name
            }
          </h1>
          {
            this.props.experimentQuery.experiment
            &&
            <MetaDataEditor
              experimentId={this.props.match.params.experimentId}
              valueAsJSON={this.props.experimentQuery.experiment.metadata}
            />
          }
          {
            Auth.isAuthenticated()
            ?
            <NextWorkspaceBtn
              bsStyle="primary"
              experimentId={experimentId}
              label={"Participate in experiment"} 
            />
            :
            <span style={{ fontSize: "16px", fontWeight: 600 }}>Please login to participate in this experiment!</span>
          }
        </ContentContainer>
      </div>
    );
  }
}

const EXPERIMENT_QUERY = gql`
  query experimentQuery($id: String) {
    experiment(id: $id) {
      id
      name
      metadata
    }
  } 
`;

const options = props => ({
  variables: {
    id: props.match.params.experimentId,
  },
});

export const ExperimentShowPage: any = compose(
  graphql(EXPERIMENT_QUERY, {
    name: "experimentQuery",
    options
  })
)(ExperimentShowPagePresentational);
