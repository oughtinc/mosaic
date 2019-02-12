import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import styled from "styled-components";

import { ContentContainer } from  "../../components/ContentContainer";
import { Auth } from "../../auth";
import { MetaDataEditor } from "../../components/MetadataEditor";
import { ExperimentControl } from "../RootWorkspacePage/ExperimentsControls/ExperimentControl";

import {
  blockBorderAndBoxShadow,
  blockBodyCSS,
} from "../../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  ${blockBodyCSS};
`;

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
            Auth.isAdmin()
            &&
            <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", padding: "10px", marginBottom: "10px", maxWidth: "800px" }}>
              <ExperimentControl
                experiment={this.props.experimentQuery.experiment}
                fallbacks={this.props.experimentQuery.experiment.fallbacks}
                onEligibilityRankChange={(experimentId, value) => {
                  this.props.updateExperimentEligibilityRankMutation({
                    variables: {
                      experimentId,
                      eligibilityRank: value,
                    },
                  });
                }}  
                updateExperimentName={async ({ experimentId, name }) => await this.props.updateExperimentNameMutation({
                  variables: {
                    experimentId,
                    name,
                  },
                })}
              />
            </div>
          }
          {
            this.props.experimentQuery.experiment
            &&
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <MetaDataEditor
                experimentId={this.props.match.params.experimentId}
                valueAsJSON={this.props.experimentQuery.experiment.metadata}
              />
            </BlockContainer>
          }
          {
            Auth.isAuthenticated()
            ?
            (
              this.props.experimentQuery.experiment
              &&
              this.props.experimentQuery.experiment.eligibilityRank === 1
              &&
              <NextWorkspaceBtn
                bsStyle="primary"
                experimentId={experimentId}
                label={"Participate in experiment"} 
              />
            )
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
      eligibilityRank
      name
      metadata
      fallbacks {
        id
        createdAt
        name
      }
    }
  } 
`;

const UPDATE_EXPERIMENT_NAME_MUTATION = gql`
  mutation updateExperimentName($experimentId: String, $name: String) {
    updateExperimentName(experimentId: $experimentId, name: $name)
  }
`;

const UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION = gql`
  mutation updateExperimentEligibilityRank($eligibilityRank: Int, $experimentId: String) {
    updateExperimentEligibilityRank(eligibilityRank: $eligibilityRank, experimentId: $experimentId)
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
  }),
  graphql(UPDATE_EXPERIMENT_NAME_MUTATION, {
    name: "updateExperimentNameMutation",
    options: {
      refetchQueries: ["experimentQuery"],
    }
  }),
  graphql(UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION, {
    name: "updateExperimentEligibilityRankMutation",
    options: {
      refetchQueries: ["experimentQuery"],
    }
  }),
)(ExperimentShowPagePresentational);
