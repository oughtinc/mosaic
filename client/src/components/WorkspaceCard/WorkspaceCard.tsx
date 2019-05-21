import { DateTime } from "luxon";
import styled, { css } from "styled-components";
import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { scroller, Element } from "react-scroll";

import { secondsToDurationString } from "../helpers/secondsToDurationString";

import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";
import _ = require("lodash");
import { ChildBudgetBadge } from "../ChildBudgetBadge";

import { AdminCheckboxThatTogglesWorkspaceField } from "../AdminCheckboxThatTogglesWorkspaceField";

import { Auth } from "../../auth";

import { blockBorderAndBoxShadow, treeWorkspaceBgColor } from "../../styles";

export enum toggleTypes {
  FULL,
  QUESTION = 0,
  ANSWER,
  SCRATCHPAD,
  CHILDREN,
}

const WorkspaceLink = props => (
  <Link to={`/workspaces/${props.workspaceId}`}>{props.children}</Link>
);

const Container = styled.div`
  float: left;
`;

const CardBody: any = styled.div`
  ${blockBorderAndBoxShadow};
  ${(props: any) =>
    (props.workspace.isEligibleForHonestOracle &&
      css`
        border: 3px solid green;
      `) ||
    (props.workspace.isEligibleForMaliciousOracle &&
      css`
        border: 3px solid red;
      `)}
  ${(props: any) =>
    props.isActive
      ? css`
          box-shadow: 0 0 10px 5px yellow;
        `
      : css`
          box-shadow: none;
        `}
  float: left;
  margin-bottom: 1em;
  width: 42em;
  background: ${treeWorkspaceBgColor};
  position: relative;
`;

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
  childWorkspaces: any;
  connectedPointersOfSubtree: ConnectedPointerType[];
  currentlyActiveUser: any;
  id: string;
  isStale: boolean;
  isEligibleForHonestOracle: boolean;
  isEligibleForMaliciousOracle: boolean;
  budgetUsedWorkingOnThisWorkspace: number;
  allocatedBudget: number;
  wasAnsweredByOracle: boolean;
  isArchived: boolean;
  subtreeTimeSpentData: any;
  isNotStaleRelativeToUserFullInformation: any;
}

interface WorkspaceCardProps {
  activeWorkspaceId: string;
  ejectUserFromCurrentWorkspace: any;
  isExpanded: boolean;
  isTopLevelOfCurrentTree: boolean;
  markWorkspaceStaleForUser: any;
  parentPointers: ConnectedPointerType[];
  workspaceId: string;
  subtreeQuery: SubtreeQuery;
  subtreeTimeSpentQuery: any;
  subtreeTimeSpentData: any;
  oracleModeQuery: any;
  updateWorkspace: any;
  workspaceActivityQuery: any;
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
        [toggleTypes.CHILDREN]: this.props.isExpanded ? true : false,
      },
    };
  }

  public componentDidMount() {
    const isThisActiveWorkspace =
      this.props.activeWorkspaceId === this.props.subtreeQuery.workspace.id;
    if (isThisActiveWorkspace) {
      setTimeout(() => {
        scroller.scrollTo(this.props.activeWorkspaceId, {
          duration: 500,
          smooth: true,
        });
      }, 3000);
    }
  }

  public handleChangeToggle = (name: toggleTypes, value: boolean) => {
    const newToggles = { ...this.state.toggles };
    newToggles[name] = value;
    this.setState({ toggles: newToggles });
  };

  public render() {
    const workspace: WorkspaceType = this.props.subtreeQuery.workspace;

    const editable = Auth.isAuthorizedToEditWorkspace(workspace);
    const isActive = this.props.activeWorkspaceId === workspace.id;

    const availablePointers: ConnectedPointerType[] = !this.props
      .isTopLevelOfCurrentTree
      ? this.props.parentPointers
      : workspace
      ? _(workspace.connectedPointersOfSubtree)
          .uniqBy(getPointerId)
          .map(node => ({ ...node, readOnly: !editable }))
          .value()
      : [];

    const subtreeTimeSpentData = this.props.isTopLevelOfCurrentTree
      ? JSON.parse(this.props.subtreeTimeSpentQuery.subtreeTimeSpent)
      : this.props.subtreeTimeSpentData;

    return (
      <Element name={workspace.id}>
        <Container style={{ opacity: workspace.isArchived ? 0.25 : 1 }}>
          <CardBody isActive={isActive} workspace={workspace}>
            <div
              style={{
                backgroundColor: "#f8f8f8",
                borderBottom: "1px solid #ddd",
                color: "#999",
                fontSize: "12px",
                padding: "10px",
              }}
            >
              <div>
                <WorkspaceLink workspaceId={workspace.serialId}>
                  Go to workspace »
                </WorkspaceLink>
              </div>
              {Auth.isAdmin() && workspace.currentlyActiveUser && (
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    marginBottom: "10px",
                    paddingBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                    }}
                  >
                    Currently assigned to:{" "}
                    <span style={{ color: "red", fontWeight: 600 }}>
                      {workspace.currentlyActiveUser.givenName
                        ? `${workspace.currentlyActiveUser.givenName} ${
                            workspace.currentlyActiveUser.familyName
                          }`
                        : workspace.currentlyActiveUser.email ||
                          workspace.currentlyActiveUser.id}
                      <Button
                        bsSize="xsmall"
                        onClick={async () => {
                          await this.props.ejectUserFromCurrentWorkspace({
                            userId: workspace.currentlyActiveUser.id,
                            workspaceId: workspace.id,
                          });

                          this.props.subtreeQuery.updateQuery(
                            (prv: any, opt: any) => {
                              return {
                                ...prv,
                                workspace: {
                                  ...prv.workspace,
                                  currentlyActiveUser: null,
                                },
                              };
                            },
                          );
                        }}
                        style={{ marginLeft: "10px" }}
                      >
                        un-assign
                      </Button>
                    </span>
                  </span>
                </div>
              )}
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  height: "40px",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <ChildBudgetBadge
                    noBadge={true}
                    shouldShowSeconds={false}
                    style={{ color: "#555", fontSize: "12px" }}
                    totalBudget={subtreeTimeSpentData[workspace.id]}
                  />{" "}
                  work on entire subtree
                  <br />
                  <ChildBudgetBadge
                    noBadge={true}
                    shouldShowSeconds={false}
                    style={{ color: "#555", fontSize: "12px" }}
                    totalBudget={workspace.budgetUsedWorkingOnThisWorkspace}
                  />{" "}
                  work on workspace
                </span>
                {Auth.isAdmin() && (
                  <span style={{ padding: "0 10px" }}>
                    <AdminCheckboxThatTogglesWorkspaceField
                      checkboxLabelText="stale"
                      updateMutation={this.handleOnIsStaleCheckboxChange}
                      workspace={workspace}
                      workspaceFieldToUpdate="isStale"
                    />
                    <AdminCheckboxThatTogglesWorkspaceField
                      checkboxLabelText="honest"
                      updateMutation={
                        this.handleOnIsEligibleForOracleCheckboxChange
                      }
                      workspace={workspace}
                      workspaceFieldToUpdate="isEligibleForHonestOracle"
                    />
                    <AdminCheckboxThatTogglesWorkspaceField
                      checkboxLabelText="malicious"
                      updateMutation={
                        this.handleOnIsEligibleForMaliciousOracleCheckboxChange
                      }
                      workspace={workspace}
                      workspaceFieldToUpdate="isEligibleForMaliciousOracle"
                    />
                    <AdminCheckboxThatTogglesWorkspaceField
                      checkboxLabelText="resolved"
                      updateMutation={
                        this.handleOnIsCurrentlyResolvedCheckboxChange
                      }
                      workspace={workspace}
                      workspaceFieldToUpdate="isCurrentlyResolved"
                    />
                  </span>
                )}
              </div>
              {Auth.isAdmin() &&
                workspace.isNotStaleRelativeToUserFullInformation.length !==
                  0 && (
                  <div
                    style={{
                      padding: "10px 10px 0 10px",
                      width: "100%",
                    }}
                  >
                    Users who have passed on workspace with "Needs More Work":
                    <ul style={{ paddingInlineStart: "30px" }}>
                      {workspace.isNotStaleRelativeToUserFullInformation.map(
                        (user, i, arr) => {
                          return (
                            <li
                              key={user.id}
                              style={{
                                margin:
                                  i < arr.length - 1 ? "10px 0" : "5px 0 0 0",
                              }}
                            >
                              {user.givenName
                                ? `${user.givenName} ${user.familyName}`
                                : user.email || user.id}
                              <Button
                                bsSize="xsmall"
                                onClick={async () => {
                                  await this.props.markWorkspaceStaleForUser({
                                    userId: user.id,
                                    workspaceId: workspace.id,
                                  });

                                  this.props.subtreeQuery.updateQuery(
                                    (prv: any, opt: any) => {
                                      return {
                                        ...prv,
                                        workspace: {
                                          ...prv.workspace,
                                          isNotStaleRelativeToUserFullInformation: prv.workspace.isNotStaleRelativeToUserFullInformation.filter(
                                            u => u.id !== user.id,
                                          ),
                                        },
                                      };
                                    },
                                  );
                                }}
                                style={{ marginLeft: "8px" }}
                              >
                                make stale for user
                              </Button>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                )}
              {Auth.isAdmin() && (
                <div style={{ marginTop: "10px" }}>
                  {this.props.workspaceActivityQuery.workspaceActivity &&
                    _.sortBy(
                      this.props.workspaceActivityQuery.workspaceActivity
                        .assignments,
                      a => -Number(a.startAtTimestamp),
                    ).map((a, i) => (
                      <div key={i}>
                        <img
                          src={a.user.pictureURL}
                          style={{
                            borderRadius: "15px",
                            boxShadow: "1px 1px 1px 1px #888",
                            height: "30px",
                            marginBottom: "8px",
                            marginRight: "8px",
                            width: "30px",
                          }}
                        />
                        {a.user.givenName
                          ? `${a.user.givenName} ${a.user.familyName}`
                          : a.user.email || a.user.id}
                        {" - "}
                        {secondsToDurationString(
                          Math.round(
                            (Number(a.endAtTimestamp) -
                              Number(a.startAtTimestamp)) /
                              1000,
                          ),
                          true,
                        )}
                        {" - "}
                        {DateTime.fromMillis(
                          Number(a.startAtTimestamp),
                        ).toLocaleString(DateTime.DATETIME_SHORT)}
                      </div>
                    ))}
                </div>
              )}
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
                !this.state.toggles[toggleTypes.CHILDREN],
              )
            }
            subtreeTimeSpentData={subtreeTimeSpentData}
          />
        </Container>
      </Element>
    );
  }

  // TODO: This code template for checkboxes is reused in several places (Here and in RootWorkspacePage/index.tsx).  Unify usage?
  private handleOnIsStaleCheckboxChange = async () => {
    await this.props.updateWorkspace({
      variables: {
        id: this.props.workspaceId,
        input: {
          isStale: !this.props.subtreeQuery.workspace.isStale,
        },
      },
    });

    this.props.subtreeQuery.updateQuery((prv: any, opt: any) => {
      return {
        ...prv,
        workspace: {
          ...prv.workspace,
          isStale: !this.props.subtreeQuery.workspace.isStale,
        },
      };
    });
  };

  private handleOnIsEligibleForOracleCheckboxChange = async () => {
    await this.props.updateWorkspace({
      variables: {
        id: this.props.workspaceId,
        input: {
          isEligibleForHonestOracle: !this.props.subtreeQuery.workspace
            .isEligibleForHonestOracle,
        },
      },
    });

    this.props.subtreeQuery.updateQuery((prv: any, opt: any) => {
      return {
        ...prv,
        workspace: {
          ...prv.workspace,
          isEligibleForHonestOracle: !this.props.subtreeQuery.workspace
            .isEligibleForHonestOracle,
        },
      };
    });
  };

  private handleOnIsEligibleForMaliciousOracleCheckboxChange = async () => {
    await this.props.updateWorkspace({
      variables: {
        id: this.props.workspaceId,
        input: {
          isEligibleForMaliciousOracle: !this.props.subtreeQuery.workspace
            .isEligibleForMaliciousOracle,
        },
      },
    });

    this.props.subtreeQuery.updateQuery((prv: any, opt: any) => {
      return {
        ...prv,
        workspace: {
          ...prv.workspace,
          isEligibleForMaliciousOracle: !this.props.subtreeQuery.workspace
            .isEligibleForMaliciousOracle,
        },
      };
    });
  };

  private handleOnIsCurrentlyResolvedCheckboxChange = async () => {
    await this.props.updateWorkspace({
      variables: {
        id: this.props.workspaceId,
        input: {
          isCurrentlyResolved: !this.props.subtreeQuery.workspace
            .isCurrentlyResolved,
        },
      },
    });

    this.props.subtreeQuery.updateQuery((prv: any, opt: any) => {
      return {
        ...prv,
        workspace: {
          ...prv.workspace,
          isCurrentlyResolved: !this.props.subtreeQuery.workspace
            .isCurrentlyResolved,
        },
      };
    });
  };
}
