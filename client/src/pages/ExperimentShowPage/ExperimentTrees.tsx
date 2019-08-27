import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { RootWorkspace } from "../RootWorkspacePage/RootWorkspace";

export class ExperimentTreesPresentational extends React.Component<any, any> {
  public render() {
    const haveTreesLoaded = this.props.experimentQuery.experiment;

    if (!haveTreesLoaded) {
      return <div>Loading trees...</div>;
    }

    const experiment = this.props.experimentQuery.experiment;

    return (
      <div>
        {experiment.trees.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Workspaces
            </h2>
            {_.sortBy(experiment.trees, t =>
              Date.parse(t.rootWorkspace.createdAt),
            ).map(tree => (
              <div
                key={`${tree.rootWorkspace.id}`}
                style={{
                  marginBottom: "10px",
                }}
              >
                <RootWorkspace
                  sourceQueries={["experimentQuery"]}
                  workspace={tree.rootWorkspace}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const EXPERIMENT_QUERY = gql`
  query experimentQuery($id: String) {
    experiment(id: $id) {
      id
      trees {
        id
        rootWorkspace {
          id
          serialId
          createdAt
          parentId
          totalBudget
          allocatedBudget
          blocks {
            id
            type
            value
          }
          tree {
            id
            doesAllowOracleBypass
            isMIBWithoutRestarts
            schedulingPriority
            experiments {
              id
              serialId
              createdAt
              name
            }
          }
          isEligibleForAssignment
          canShowCompactTreeView
          hasIOConstraints
          hasTimeBudget
        }
      }
    }
  }
`;

const options = props => ({
  variables: {
    id: props.experimentId,
  },
});

export const ExperimentTrees: any = compose(
  graphql(EXPERIMENT_QUERY, {
    name: "experimentQuery",
    options,
  }),
)(ExperimentTreesPresentational);
