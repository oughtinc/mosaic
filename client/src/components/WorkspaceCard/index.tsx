import gql from "graphql-tag";
import styled from "styled-components";
import * as React from "react";
import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Checkbox } from "react-bootstrap";
import _ = require("lodash");
import {
  ROOT_WORKSPACE_SUBTREE_QUERY,
  CHILD_WORKSPACE_SUBTREE_QUERY,
  UPDATE_WORKSPACE_STALENESS,
  UPDATE_WORKSPACE_IS_ELIGIBLE_FOR_ORACLE
} from "../../graphqlQueries";
import { ChildBudgetBadge } from "../ChildBudgetBadge";

import { Auth } from "../../auth";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,  
  blockBorderAndBoxShadow,
  treeWorkspaceBgColor,
} from "../../styles";

export enum toggleTypes {
  FULL,
  QUESTION = 0,
  ANSWER,
  SCRATCHPAD,
  CHILDREN
}

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const SUBTREE_TIME_SPENT_QUERY = gql`
query subtreeTimeSpentQuery($id: String!) {
  subtreeTimeSpent(id: $id)
}
`;

const Container = styled.div`
  float: left;
`;

const CardBody = styled.div`
  ${blockBorderAndBoxShadow};
  float: left;
  margin-bottom: 1em;
  width: 40em;
  background: ${treeWorkspaceBgColor};
  position: relative;
`;

const LoadingMsg = ({ isTopLevelOfCurrentTree }) => {
  return (
    <div>
      {
        isTopLevelOfCurrentTree
        ?
        "Loading... This may take some time for complex trees."
        :
        "Loading..."
      }
    </div>
  );
};

// TODO: Eventually these should be used in a common file for many cases that use them.
interface ConnectedPointerType {
  data: any;
  isVoid: boolean;
  object: string;
  type: string;
  nodes: any[];
}

interface WorkspaceType {
  blocks: any[];
  childWorkspaceOrder: string[];
  connectedPointersOfSubtree: ConnectedPointerType[];
  id: string;
  isStale: boolean;
  isEligibleForOracle: boolean;
  budgetUsedWorkingOnThisWorkspace: number;
  allocatedBudget: number;
  wasAnsweredByOracle: boolean;
  isArchived: boolean;
  subtreeTimeSpentData: any;
}

interface WorkspaceCardProps {
  isTopLevelOfCurrentTree: boolean;
  parentPointers: ConnectedPointerType[];
  workspaceId: string;
  subtreeQuery: SubtreeQuery;
  subtreeTimeSpentQuery: any;
  subtreeTimeSpentData: any;
  oracleModeQuery: any;
  updateWorkspaceStaleness: any;
  updateWorkspaceIsEligibleForOracle: any;
}

interface SubtreeQuery {
  loading: boolean;
  workspace: any;
  refetch: any;
  updateQuery: any;
}

interface WorkspaceCardState {
  toggles: {
    [toggleTypes.SCRATCHPAD]: boolean;
    [toggleTypes.CHILDREN]: boolean;
  };
  isStaleCheckboxStatusPending: boolean;
  isEligibleForOracleCheckboxStatusPending: boolean;  
}

const getPointerId = (p: any) => p.data.pointerId;

export class WorkspaceCardPresentational extends React.PureComponent<
  WorkspaceCardProps,
  WorkspaceCardState
> {
  public constructor(props: any) {
    super(props);
    this.state = {
      toggles: {
        [toggleTypes.SCRATCHPAD]: true,
        [toggleTypes.CHILDREN]: false
      },
      isStaleCheckboxStatusPending: false,
      isEligibleForOracleCheckboxStatusPending: false
    };
  }

  public componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.subtreeQuery.loading || prevProps.subtreeQuery.loading) {
      return;
    }

    const isStaleDidChange = this.props.subtreeQuery.workspace.isStale !== prevProps.subtreeQuery.workspace.isStale;
    const isEligibleForOracleDidChange = this.props.subtreeQuery.workspace.isEligibleForOracle !== prevProps.subtreeQuery.workspace.isEligibleForOracle;


    if (isStaleDidChange || isEligibleForOracleDidChange) {
      this.setState({
        isStaleCheckboxStatusPending: isStaleDidChange ? false : this.state.isStaleCheckboxStatusPending,
        isEligibleForOracleCheckboxStatusPending: isEligibleForOracleDidChange ? false : this.state.isEligibleForOracleCheckboxStatusPending
      });
    }
  }

  public handleChangeToggle = (name: toggleTypes, value: boolean) => {
    const newToggles = { ...this.state.toggles };
    newToggles[name] = value;
    this.setState({ toggles: newToggles });
  };

  public render() {
    const workspace: WorkspaceType | undefined =
      this.props.subtreeQuery.loading
      ?
      undefined
      :
      this.props.subtreeQuery.workspace;

    const editable = Auth.isAuthorizedToEditWorkspace(workspace);

    const availablePointers: ConnectedPointerType[] =
      !this.props.isTopLevelOfCurrentTree
      ?
      this.props.parentPointers
      :
        (
          workspace
          ?
          _(workspace.connectedPointersOfSubtree)
            .uniqBy(getPointerId)
            .map(node => ({...node, readOnly: !editable }))
            .value()
          :
          []
        );

    if (!workspace) {
      return <LoadingMsg isTopLevelOfCurrentTree={this.props.isTopLevelOfCurrentTree}/>;
    }

    const subtreeTimeSpentData =
      this.props.isTopLevelOfCurrentTree
      ?
      JSON.parse(this.props.subtreeTimeSpentQuery.subtreeTimeSpent)
      :
      this.props.subtreeTimeSpentData;

    const isInOracleMode = this.props.oracleModeQuery.oracleMode;

    return (
      <Container style={{ opacity: workspace.isArchived ? 0.25 : 1 }}>
        <CardBody>
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#f8f8f8",
              borderBottom: "1px solid #ddd",
              color: "#999",
              fontSize: "12px",
              display: "flex",
              height: "40px",
              justifyContent: "space-between",
            }}
          >
            <span style={{ padding: "0 10px"}}>
              <ChildBudgetBadge
                noBadge={true}
                shouldShowSeconds={false}
                style={{ color: "#555", fontSize: "12px" }}
                totalBudget={subtreeTimeSpentData[workspace.id]}
              />
              {" "}work on this entire subtree
              <br />
              <ChildBudgetBadge
                noBadge={true}
                shouldShowSeconds={false}
                style={{ color: "#555", fontSize: "12px" }}
                totalBudget={workspace.budgetUsedWorkingOnThisWorkspace}
              />
              {" "}work on this workspace
            </span>
       
            {
              workspace.wasAnsweredByOracle
              &&
              isInOracleMode
              &&
              <span style={{ color: "darkRed"}}>
                WAS ANSWERED BY ORACLE
              </span>
            }           
            <span>
              {
                workspace.isStale
                &&
                <span style={{ padding: "0 10px"}}>STALE</span>
              }
              {
                workspace.isEligibleForOracle
                &&
                isInOracleMode
                &&
                <span style={{ padding: "0 10px"}}>ORACLE ONLY</span>
              }
            </span>
          </div>
          {
            Auth.isAdmin()
            &&
            <div
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginBottom: "3px"
              }}
            >
              <Checkbox
                style={{
                  backgroundColor: adminCheckboxBgColor,
                  border: `1px solid ${adminCheckboxBorderColor}`,
                  borderRadius: "3px",
                  padding: "5px 5px 5px 25px",
                  opacity: this.state.isStaleCheckboxStatusPending ? 0.75 : 1,
                }}
                inline={true}
                type="checkbox"
                checked={workspace.isStale}
                onChange={this.handleOnIsStaleCheckboxChange}
              >
                {
                  this.state.isStaleCheckboxStatusPending
                  ?
                  "updating..."
                  :
                  "is stale"
                }
              </Checkbox>
              <Checkbox
                style={{
                  backgroundColor: adminCheckboxBgColor,
                  border: `1px solid ${adminCheckboxBorderColor}`,
                  borderRadius: "3px",
                  padding: "5px 5px 5px 25px",
                  opacity: this.state.isEligibleForOracleCheckboxStatusPending ? 0.75 : 1,
                }}
                inline={true}
                type="checkbox"
                checked={workspace.isEligibleForOracle}
                onChange={this.handleOnIsEligibleForOracleCheckboxChange}
              >
                {
                  this.state.isEligibleForOracleCheckboxStatusPending
                  ?
                  "updating..."
                  :
                  "is eligible for oracle"
                }
              </Checkbox>            
            </div>          
          }            
          <BlockSection
            workspace={workspace}
            availablePointers={availablePointers}
          />
        </CardBody>
        <ChildrenSection
          parentPointers={availablePointers}
          workspace={workspace}
          childrenToggle={this.state.toggles[toggleTypes.CHILDREN]}
          onChangeToggle={() =>
            this.handleChangeToggle(
              toggleTypes.CHILDREN,
              !this.state.toggles[toggleTypes.CHILDREN]
            )
          }
          subtreeTimeSpentData={subtreeTimeSpentData}
        />
      </Container>
    );
  }

  // TODO: This code template for checkboxes is reused in several places (Here and in RootWorkspacePage/index.tsx).  Unify usage?
  private handleOnIsStaleCheckboxChange = () => {
    if (this.state.isStaleCheckboxStatusPending) {
      return;
    }
  
    this.setState({ isStaleCheckboxStatusPending: true }, () => {
        setTimeout(() => {
          this.props.updateWorkspaceStaleness({
            variables: {
              isStale: !this.props.subtreeQuery.workspace.isStale,
              workspaceId: this.props.workspaceId,
            },
          }).then((() => {
            this.props.subtreeQuery.updateQuery((prv: any, opt: any) => ({
              ...prv,
              workspace: {
                ...prv.workspace,
                isStale: !this.props.subtreeQuery.workspace.isStale}
              }))
            }));
          }, 200);
      }
    );
  }

  private handleOnIsEligibleForOracleCheckboxChange = () => {
    if (this.state.isEligibleForOracleCheckboxStatusPending) {
      return;
    }
  
  
    this.setState({ isEligibleForOracleCheckboxStatusPending: true }, () => {
      setTimeout(() => {
        this.props.updateWorkspaceIsEligibleForOracle({
          variables: {
            isEligibleForOracle: !this.props.subtreeQuery.workspace.isEligibleForOracle,
            workspaceId: this.props.workspaceId,
          },
        }).then((() => {
          this.props.subtreeQuery.updateQuery((prv: any, opt: any) => ({
            ...prv,
            workspace: {
              ...prv.workspace,
              isEligibleForOracle: !this.props.subtreeQuery.workspace.isEligibleForOracle}
            }))
          }));
        }, 200);
      }
    );
  }    
}

const optionsForTopLevel = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "cache-and-network",
  variables: { workspaceId },
  skip: !isTopLevelOfCurrentTree
});

const optionsForNested = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "cache-and-network",
  variables: { workspaceId },
  skip: isTopLevelOfCurrentTree
});

const optionsForSubtreeTimeSpentQuery = ({ workspaceId, isTopLevelOfCurrentTree }) => ({
  fetchPolicy: "cache-and-network",
  variables: { id: workspaceId },
  skip: !isTopLevelOfCurrentTree
});

export const WorkspaceCard: any = compose(
  graphql(ROOT_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForTopLevel,
  }),
  graphql(CHILD_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForNested,
  }),
  graphql(SUBTREE_TIME_SPENT_QUERY, {
    name: "subtreeTimeSpentQuery",
    options: optionsForSubtreeTimeSpentQuery,
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
  graphql(UPDATE_WORKSPACE_STALENESS, {
    name: "updateWorkspaceStaleness"
  }),
  graphql(UPDATE_WORKSPACE_IS_ELIGIBLE_FOR_ORACLE, {
    name: "updateWorkspaceIsEligibleForOracle"
  }),    
)(WorkspaceCardPresentational);
