import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { ControlLabel, FormGroup, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { compose } from "recompose";
import styled from "styled-components";

import {
  homepageWorkspaceBgColor,
  blockBorderAndBoxShadow
} from "../../../styles";

const ExperimentsContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  padding: 10px;
  margin-bottom: 30px;
`;

const isActive = e => e.eligibilityRank === 1;
const isFallback = e => e.eligibilityRank === 2;
const isInactive = e => e.eligibilityRank !== 1 && e.eligibilityRank !== 2;

export class ListOfExperimentsPresentational extends React.Component<any, any> {
  public render() {
    return (
      <ExperimentsContainer>
        {
          this.props.experimentsQuery.loading
          ? 
          "Loading..."
          : 
          this.props.experimentsQuery.experiments.map(e => {
            return (
              <div key={e.id}>
                <FormGroup controlId="formControlsSelect">
                  <ControlLabel>{e.name}</ControlLabel>
                  <br />
                  <ToggleButtonGroup
                    bsSize="xsmall"
                    type="radio" 
                    name="options" 
                    value={e.eligibilityRank === null ? 0 : e.eligibilityRank}
                    onChange={value => this.onEligibilityRankChange(e.id, value)}
                  >
                    <ToggleButton value={1}>active</ToggleButton>
                    <ToggleButton value={2}>fallback</ToggleButton>
                    <ToggleButton value={0}>inactive</ToggleButton>
                  </ToggleButtonGroup>
                </FormGroup>
              </div>
            );
          })
        }
      </ExperimentsContainer>
    );
  }

  private onEligibilityRankChange = (experimentId, value) => {
    this.props.updateExperimentEligibilityRankMutation({
      variables: {
        experimentId,
        eligibilityRank: value,
      },
    });
  }
}

const EXPERIMENTS_QUERY = gql`
  query experiments {
    experiments {
      id
      createdAt
      name
      eligibilityRank
    }
  }
`; 

const UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION = gql`
  mutation updateExperimentEligibilityRank($eligibilityRank: Int, $experimentId: String) {
    updateExperimentEligibilityRank(eligibilityRank: $eligibilityRank, experimentId: $experimentId)
  }
`; 

export const ListOfExperiments: any = compose(
  graphql(EXPERIMENTS_QUERY, {
    name: "experimentsQuery"
  }),
  graphql(UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION, {
    name: "updateExperimentEligibilityRankMutation",
    options: {
      refetchQueries: ["experiments"],
    }
  })
)(ListOfExperimentsPresentational);
