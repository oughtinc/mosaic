import styled from "styled-components";
import * as React from "react";
import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import _ = require("lodash");
import {
  ROOT_WORKSPACE_SUBTREE_QUERY,
  CHILD_WORKSPACE_SUBTREE_QUERY,
} from "../../graphqlQueries";
import { ChildBudgetBadge } from "../ChildBudgetBadge";

import { Auth } from "../../auth";

import {
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
  totalBudget: number;
  allocatedBudget: number;
  wasAnsweredByOracle: boolean;
  isArchived: boolean;
}

interface WorkspaceCardProps {
  isTopLevelOfCurrentTree: boolean;
  parentPointers: ConnectedPointerType[];
  workspaceId: string;
  subtreeQuery: SubtreeQuery;
}

interface SubtreeQuery {
  loading: boolean;
  workspace: any;
}

interface WorkspaceCardState {
  toggles: {
    [toggleTypes.SCRATCHPAD]: boolean;
    [toggleTypes.CHILDREN]: boolean;
  };
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
        [toggleTypes.CHILDREN]: true
      }
    };
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
    return (
      <Container style={{ opacity: workspace.isArchived ? 0.25 : 1 }}>
        <CardBody>
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#f8f8f8",
              borderBottom: "1px solid #ddd",
              color: "#999",
              fontSize: "11px",
              display: "flex",
              height: "70px",
              justifyContent: "space-between",
            }}
          >
            <span style={{ padding: "0 10px"}}>
              <ChildBudgetBadge
                noBadge={true}
                style={{ color: "#555", fontSize: "10px" }}
                totalBudget={workspace.totalBudget}
              />
              {" "}available
              <br />
              <ChildBudgetBadge
                noBadge={true}
                style={{ color: "#555", fontSize: "10px" }}
                totalBudget={workspace.allocatedBudget - workspace.budgetUsedWorkingOnThisWorkspace}
              />
              {" "}subquestions
              <br />
              <ChildBudgetBadge
                noBadge={true}
                style={{ color: "#555", fontSize: "10px" }}
                totalBudget={workspace.budgetUsedWorkingOnThisWorkspace}
              />
              {" "}direct work
            </span>
            {
              workspace.wasAnsweredByOracle
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
                <span style={{ padding: "0 10px"}}>ORACLE ONLY</span>
              }
            </span>
          </div>
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
        />
      </Container>
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

export const WorkspaceCard: any = compose(
  graphql(ROOT_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForTopLevel,
  }),
  graphql(CHILD_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForNested,
  }),
)(WorkspaceCardPresentational);
