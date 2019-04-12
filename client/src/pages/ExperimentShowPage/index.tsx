import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import styled from "styled-components";

import { NewRootWorkspaceForExperimentForm } from "./NewRootWorkspaceForExperimentForm";
import { ContentContainer } from  "../../components/ContentContainer";
import { Auth } from "../../auth";
import { CREATE_ROOT_WORKSPACE } from "../../graphqlQueries";
import { MetaDataEditor } from "../../components/MetadataEditor";
import { InstructionsEditor } from "../../components/InstructionsEditor";
import { ExperimentControl } from "../RootWorkspacePage/ExperimentsControls/ExperimentControl";
import { RootWorkspace } from "../RootWorkspacePage/RootWorkspace";

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
    const hasExperimentLoaded = this.props.experimentQuery.experiment;

    if (!hasExperimentLoaded) {
      return <ContentContainer>Loading experiment page...</ContentContainer>;
    }

    const experiment = this.props.experimentQuery.experiment;
    const isExperimentActive = experiment.eligibilityRank === 1;
    const isUserLoggedIn = Auth.isAuthenticated();
    const isUserAdmin = Auth.isAdmin();

    return (
      <ContentContainer>
        <Helmet>
          <title>
            {experiment.name} - Mosaic
          </title>
        </Helmet>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          {experiment.name}
        </h1>
        {
          isUserAdmin
          &&
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              marginBottom: "10px",
              maxWidth: "800px",
              padding: "10px",
            }}
          >
            <ExperimentControl
              experiment={experiment}
              fallbacks={experiment.fallbacks}
              onEligibilityRankChange={(experimentId, value) => {
                this.props.updateExperimentEligibilityRankMutation({
                  variables: {
                    experimentId,
                    eligibilityRank: value,
                  },
                });
              }}
              onDefaultOracleChange={(experimentId, value) => {
                this.props.updateExperimentDefaultOracleMutation({
                  variables: {
                    experimentId,
                    defaultOracle: value,
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
        <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
          <MetaDataEditor
            experimentId={experiment.id}
            valueAsJSON={experiment.metadata}
          />
        </BlockContainer>
        {
          isExperimentActive
          &&
          (
            isUserLoggedIn
            ?
            <NextWorkspaceBtn
              bsStyle="primary"
              experimentId={experiment.id}
              label={"Participate in experiment"} 
            />
            :
            <span 
              style={{
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Please login to participate in this experiment!
            </span>
          )
        }
        {
          (
            !isExperimentActive
            ||
            isUserAdmin
          )
          &&
          experiment.trees.length > 0
          &&
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Workspaces
            </h2>
            {
              _.sortBy(
                experiment.trees,
                t => Date.parse(t.rootWorkspace.createdAt)
              ).map(tree =>
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
              )
            }
          </div>
        }
        {
          isUserAdmin
          &&
          <React.Fragment>
            <NewRootWorkspaceForExperimentForm
              experimentId={experiment.id}
              maxTotalBudget={100000}
              createWorkspace={this.props.createWorkspaceMutation}
              shouldAutosave={false}
              style={{ marginTop: "50px" }}
            />
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Instructions
            </h2>

            <h3 style={{ fontSize: "18px" }}>
              For root workspaces:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="root"
                instructions={experiment.instructions.root}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For honest oracles:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="honestOracle"
                instructions={experiment.instructions.honestOracle}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For malicious oracles:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="maliciousOracle"
                instructions={experiment.instructions.maliciousOracle}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For users returning to a root workspace:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="returningRoot"
                instructions={experiment.instructions.returningRoot}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For honest oracles returning to a workspace:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="returningHonestOracle"
                instructions={experiment.instructions.returningHonestOracle}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For malicious oracles returning to a workspace:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="returningMaliciousOracle"
                instructions={experiment.instructions.returningMaliciousOracle}
              />
            </BlockContainer>

            <h3 style={{ fontSize: "18px" }}>
              For unlocking a lazy pointer:
            </h3>
            <BlockContainer style={{ maxWidth: "800px", marginBottom: "10px" }}>
              <InstructionsEditor
                experimentId={experiment.id}
                instructionType="lazyPointerUnlock"
                instructions={experiment.instructions.lazyPointerUnlock}
              />
            </BlockContainer>
          </React.Fragment>
        }
      </ContentContainer>
    );
  }
}

const EXPERIMENT_QUERY = gql`
  query experimentQuery($id: String) {
    experiment(id: $id) {
      id
      eligibilityRank
      areNewWorkspacesOracleOnlyByDefault
      name
      metadata
      instructions {
        root
        honestOracle
        maliciousOracle
        returningRoot
        returningHonestOracle
        returningMaliciousOracle
        lazyPointerUnlock
      }
      fallbacks {
        id
        createdAt
        name
      }
      trees {
        rootWorkspace { 
          id
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
            experiments {
              id
              createdAt
              name
            }
          }
          isEligibleForAssignment
          hasIOConstraints
          hasTimeBudget
        }
      }
    }
  } 
`;

const UPDATE_EXPERIMENT_NAME_MUTATION = gql`
  mutation updateExperimentName($experimentId: String, $name: String) {
    updateExperimentName(experimentId: $experimentId, name: $name)
  }
`;

const UPDATE_EXPERIMENT_DEFAULT_ORACLE_MUTATION = gql`
  mutation updateExperimentDefaultOracle($defaultOracle: Boolean, $experimentId: String) {
    updateExperimentDefaultOracle(defaultOracle: $defaultOracle, experimentId: $experimentId)
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
  graphql(CREATE_ROOT_WORKSPACE, {
    name: "createWorkspaceMutation",
    options: {
      refetchQueries: ["experimentQuery"]
    }
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
  graphql(UPDATE_EXPERIMENT_DEFAULT_ORACLE_MUTATION, {
    name: "updateExperimentDefaultOracleMutation",
    options: {
      refetchQueries: ["experimentQuery"],
    }
  }),
)(ExperimentShowPagePresentational);
