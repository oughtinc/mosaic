import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import styled from "styled-components";

import {
  homepageWorkspaceBgColor,
  blockBorderAndBoxShadow,
} from "../../../styles";

import { ExperimentControl } from "./ExperimentControl";

const ExperimentContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  padding: 10px;
  margin-bottom: 5px;
`;

export class ListOfExperimentsPresentational extends React.Component<any, any> {
  public render() {
    const experiments =
      this.props.experimentsQuery.experiments &&
      _.sortBy(
        this.props.experimentsQuery.experiments,
        experiment => -Date.parse(experiment.createdAt),
      );

    return (
      <div style={{ marginTop: "10px" }}>
        {this.props.experimentsQuery.loading
          ? "Loading..."
          : experiments.map(e => {
              return (
                <ExperimentContainer key={e.id}>
                  <ExperimentControl
                    experiment={e}
                    fallbacks={e.fallbacks}
                    onEligibilityRankChange={this.onEligibilityRankChange}
                    onDefaultOracleChange={this.onDefaultOracleChange}
                    updateExperimentName={async ({ experimentId, name }) =>
                      await this.props.updateExperimentNameMutation({
                        variables: {
                          experimentId,
                          name,
                        },
                      })
                    }
                  />
                </ExperimentContainer>
              );
            })}
      </div>
    );
  }

  private onEligibilityRankChange = (experimentId, value) => {
    this.props.updateExperimentEligibilityRankMutation({
      variables: {
        experimentId,
        eligibilityRank: value,
      },
    });
  };

  private onDefaultOracleChange = (experimentId, value) => {
    this.props.updateExperimentDefaultOracleMutation({
      variables: {
        experimentId,
        defaultOracle: value,
      },
    });
  };
}

const EXPERIMENTS_QUERY = gql`
  query experiments {
    experiments {
      id
      createdAt
      name
      eligibilityRank
      areNewWorkspacesOracleOnlyByDefault
      fallbacks {
        id
        createdAt
        name
      }
    }
  }
`;

const UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION = gql`
  mutation updateExperimentEligibilityRank(
    $eligibilityRank: Int
    $experimentId: String
  ) {
    updateExperimentEligibilityRank(
      eligibilityRank: $eligibilityRank
      experimentId: $experimentId
    )
  }
`;

const UPDATE_EXPERIMENT_DEFAULT_ORACLE_MUTATION = gql`
  mutation updateExperimentDefaultOracle(
    $defaultOracle: Boolean
    $experimentId: String
  ) {
    updateExperimentDefaultOracle(
      defaultOracle: $defaultOracle
      experimentId: $experimentId
    )
  }
`;

const UPDATE_EXPERIMENT_NAME_MUTATION = gql`
  mutation updateExperimentName($experimentId: String, $name: String) {
    updateExperimentName(experimentId: $experimentId, name: $name)
  }
`;

export const ListOfExperiments: any = compose(
  graphql(EXPERIMENTS_QUERY, {
    name: "experimentsQuery",
  }),
  graphql(UPDATE_EXPERIMENT_ELIGIBILITY_RANK_MUTATION, {
    name: "updateExperimentEligibilityRankMutation",
    options: {
      refetchQueries: ["experiments"],
    },
  }),
  graphql(UPDATE_EXPERIMENT_DEFAULT_ORACLE_MUTATION, {
    name: "updateExperimentDefaultOracleMutation",
    options: {
      refetchQueries: ["experiments"],
    },
  }),
  graphql(UPDATE_EXPERIMENT_NAME_MUTATION, {
    name: "updateExperimentNameMutation",
    options: {
      refetchQueries: ["experiments"],
    },
  }),
)(ListOfExperimentsPresentational);
