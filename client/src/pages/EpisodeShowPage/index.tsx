import * as React from "react";
import * as keyboardJS from "keyboardjs";

import gql from "graphql-tag";
import styled from "styled-components";
import { graphql } from "react-apollo";
import { Helmet } from "react-helmet";
import * as ReactMarkdown from "react-markdown";
import { compose } from "recompose";
import { Alert, Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import { AdvancedOptions } from "./AdvancedOptions";
import { DepthDisplay } from "./DepthDisplay";
import { EpisodeNav } from "./EpisodeNav";
import { OracleAnswerCandidateFooter } from "./OracleAnswerCandidateFooter";
import { ResponseFooter } from "./ResponseFooter";
import { SelectAnswerBtn } from "./SelectAnswerBtn";
import { CharCountDisplays } from "./CharCountDisplays";
import { HonestExpertDecisionBtns } from "./HonestExpertDecisionBtns";
import { TimerAndTimeBudgetInfo } from "./TimerAndTimeBudgetInfo";
import { TimerWhenNoTimeBudget } from "./TimerWhenNoTimeBudget";
import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import {
  expandAllImports,
  closeAllPointerReferences,
} from "../../modules/blockEditor/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { ContentContainer } from "../../components/ContentContainer";
import {
  exportingBlocksPointersSelector,
  exportingNodes,
} from "../../modules/blocks/exportingPointers";
import {
  inputCharCountSelector,
  outputCharCountSelector,
} from "../../modules/blocks/charCounts";
import Plain from "slate-plain-serializer";
import * as _ from "lodash";
import { Value } from "slate";
import {
  WorkspaceRelationTypes,
  WorkspaceBlockRelation,
  WorkspaceWithRelations,
} from "./WorkspaceRelations";

import { ExpandAllPointersBtn } from "./ExpandAllPointersBtn";
import { databaseJSONToValue } from "../../lib/slateParser";
import { listOfSlateNodesToText } from "../../lib/slateParser";

import {
  ORACLE_MODE_QUERY,
  UPDATE_BLOCKS,
  UPDATE_WORKSPACE,
} from "../../graphqlQueries";
import { CONVERT_PASTED_EXPORT_TO_IMPORT } from "../../constants";
import { Auth } from "../../auth";

import { getExperimentIdOrSerialIdFromQueryParams } from "../../helpers/getExperimentIdOrSerialIdFromQueryParams";
import { getIsUserInExperimentFromQueryParams } from "../../helpers/getIsUserInExperimentFromQueryParams";
import { getDoesWorkspaceHaveTimerFromQueryParams } from "../../helpers/getDoesWorkspaceHaveTimerFromQueryParams";
import { getMomentDurationForWorkspaceTimerFromQueryParams } from "../../helpers/getMomentDurationForWorkspaceTimerFromQueryParams";

import {
  blockBorderAndBoxShadow,
  blockHeaderCSS,
  blockBodyCSS,
  workspaceViewQuestionFontSize,
} from "../../styles";

const WORKSPACE_QUERY = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      serialId
      parentId
      parentWorkspace {
        id
        parentWorkspace {
          id
          parentWorkspace {
            id
            serialId
          }
        }
      }
      parentSerialId
      creatorId
      idOfHonestAnswerCandidate
      idOfMaliciousAnswerCandidate
      isAwaitingHonestExpertDecision
      isPublic
      isStale
      isEligibleForHonestOracle
      isEligibleForMaliciousOracle
      isParentOracleWorkspace
      isUserOracleForTree
      isUserMaliciousOracleForTree
      isRequestingLazyUnlock
      rootWorkspaceId
      rootWorkspaceSerialId
      hasIOConstraintsOfRootParent
      hasTimeBudgetOfRootParent
      connectedPointers
      totalBudget
      allocatedBudget
      exportLockStatusInfo
      depth
      message
      currentlyActiveUser {
        id
      }
      childWorkspaces {
        id
        serialId
        createdAt
        totalBudget
        creatorId
        isArchived
        isEligibleForHonestOracle
        isEligibleForMaliciousOracle
        isCurrentlyResolved
        isPublic
        allocatedBudget
        blocks {
          id
          value
          type
        }
      }
      blocks {
        id
        value
        type
      }
      rootWorkspace {
        id
        blocks {
          id
          value
          type
        }
        tree {
          id
          doesAllowOracleBypass
          isMIBWithoutRestarts
          experiments {
            id
            serialId
            areNewWorkspacesOracleOnlyByDefault
          }
          depthLimit
        }
      }
    }
  }
`;

const TRANSFER_REMAINING_BUDGET_TO_PARENT = gql`
  mutation transferRemainingBudgetToParent($id: String!) {
    transferRemainingBudgetToParent(id: $id) {
      id
    }
  }
`;

const DEPLETE_BUDGET = gql`
  mutation depleteBudget($id: String!) {
    depleteBudget(id: $id) {
      id
    }
  }
`;

const NEW_CHILD = gql`
  mutation createChildWorkspace(
    $workspaceId: String
    $question: JSON
    $shouldOverrideToNormalUser: Boolean
    $totalBudget: Int
  ) {
    createChildWorkspace(
      workspaceId: $workspaceId
      question: $question
      shouldOverrideToNormalUser: $shouldOverrideToNormalUser
      totalBudget: $totalBudget
    ) {
      id
    }
  }
`;

const UPDATE_CHILD_TOTAL_BUDGET = gql`
  mutation updateChildTotalBudget(
    $workspaceId: String!
    $childId: String!
    $totalBudget: Int
  ) {
    updateChildTotalBudget(
      workspaceId: $workspaceId
      childId: $childId
      totalBudget: $totalBudget
    ) {
      id
    }
  }
`;

const NavLink = styled(Link)`
  margin-right: 5px;
`;

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  margin-bottom: 25px;
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const BlockHeader = styled.div`
  ${blockHeaderCSS};
`;

const ParentLink = props => (
  <NavLink to={`/w/${props.parentSerialId}`}>
    <Button bsStyle="default" bsSize="xsmall">
      Parent »
    </Button>
  </NavLink>
);

const GreatGrandParentLink = props => (
  <NavLink target="_blank" to={`/w/${props.greatGrandParentSerialId}`}>
    <Button bsStyle="default" bsSize="xsmall">
      Original Judge Workspace »
    </Button>
  </NavLink>
);

const RootTreeLink = ({ workspace }) => (
  <NavLink
    target="_blank"
    to={`/w/${
      workspace.rootWorkspaceSerialId
    }/compactTree?expanded=true&activeWorkspace=${workspace.id}`}
  >
    <Button bsStyle="default" bsSize="xsmall">
      Entire Tree »
    </Button>
  </NavLink>
);

const SubtreeLink = ({ workspace }) => (
  <NavLink to={`/w/${workspace.serialId}/subtree`}>
    <Button bsStyle="default" bsSize="xsmall">
      Subtree »
    </Button>
  </NavLink>
);

function findPointers(value: any) {
  const _value = value ? Value.fromJSON(value) : Plain.deserialize("");
  const pointers = exportingNodes(_value.document);
  return pointers;
}

export class WorkspaceView extends React.Component<any, any> {
  private experimentId;
  private scratchpadField;
  private answerField;
  private newChildField;
  private tickDurationForCountdownTimer = 1;
  private tickDurationForUpdatingTimeSpentWhenNoTimeBudget = 5;

  public constructor(props: any) {
    super(props);
    this.state = {
      hasTimerEnded: false,
      pastedExportFormat: CONVERT_PASTED_EXPORT_TO_IMPORT,
      shouldAutoExport: true,
      hasInitiallyLoaded: false,
      hasTakenInitialSnapshot: false,
      isAuthenticated: Auth.isAuthenticated(),
      logoutTimer: null,
    };
  }

  public async componentDidMount() {
    this.experimentId = getExperimentIdOrSerialIdFromQueryParams(
      window.location.search,
    );

    window.addEventListener("beforeunload", e => {
      setTimeout(() => {
        const isLeavingWorkspacePage =
          /^\/workspaces\//.test(window.location.pathname) ||
          /^\/w\//.test(window.location.pathname);

        if (isLeavingWorkspacePage) {
          this.snapshot(this.props, "UNLOAD");
          this.leaveCurrentWorkspace();
        }
      }, 1);
    });

    keyboardJS.bind("alt+s", e => {
      e.preventDefault();
      this.scratchpadField.focus();
    });
    keyboardJS.bind("alt+a", e => {
      e.preventDefault();
      this.answerField.focus();
    });
    keyboardJS.bind("alt+c", e => {
      e.preventDefault();
      this.newChildField.focus();
    });

    setTimeout(() => {
      this.props.closeAllPointerReferences();
      this.setState({ hasInitiallyLoaded: true });
    }, 1);

    this.updateAuthenticationState();
  }

  public async componentDidUpdate() {
    if (
      !this.state.hasTakenInitialSnapshot &&
      this.props.currentAssignmentIdQuery.currentAssignmentId &&
      this.props.workspace.workspace
    ) {
      this.snapshot(this.props, "INITIALIZE");
      this.setState({ hasTakenInitialSnapshot: true });
    }
  }

  public componentWillUnmount() {
    this.leaveCurrentWorkspace();
    this.snapshot(this.props, "UNLOAD");

    if (this.state.logoutTimer) {
      clearTimeout(this.state.logoutTimer);
    }
  }

  public updateBlocks = (blocks: any) => {
    const variables = { blocks };
    this.props.updateBlocks({
      variables,
    });
  };

  public handleTimerEnd = () => {
    this.setState({
      hasTimerEnded: true,
    });
  };

  /**
   * All "otherBlocks" should be straight from a GraphQL response.
   * This is why we need to use databaseJSONToValue on the value
   * before passing it to findPointers.
   */
  public getAvailablePointers(workspace: any, ...otherBlocks: any[]) {
    const importedPointers = workspace.connectedPointers;

    // TODO: Figure out why allReadOnlyBlocks and readOnlyExportedPointers
    // was originally included and determine if its inclusion is necessary
    const allReadOnlyBlocks = new WorkspaceWithRelations(
      workspace,
    ).allReadOnlyBlocks();

    let readOnlyExportedPointers = [];
    try {
      readOnlyExportedPointers = _.flatten(
        allReadOnlyBlocks.map(b => findPointers(b.value)),
      );
    } catch (err) {
      if (window.FS && window.FS.log) {
        window.FS.log("error", err.toString());
      } else {
        console.log(err);
      }
    }

    const otherPointers = _.flatten(
      otherBlocks.map(b => findPointers(databaseJSONToValue(b.value))),
    );

    const unsortedAvailablePointers = _.uniqBy(
      [
        ...this.props.exportingPointers,
        ...importedPointers,
        ...readOnlyExportedPointers,
        ...otherPointers,
      ],
      p => p.data.pointerId,
    );

    const availablePointers = _.orderBy(
      unsortedAvailablePointers,
      ["data.pointerId"],
      ["asc"],
    );

    return availablePointers;
  }

  public snapshot(props: any, action: string = "INITIALIZE") {
    const assignmentId = props.currentAssignmentIdQuery.currentAssignmentId;
    if (!assignmentId) {
      return;
    }

    const workspace = props.workspace.workspace;

    const workspaceBlocks: any = _.flatten(
      workspace.blocks.concat(workspace.childWorkspaces.map(cw => cw.blocks)),
    );

    // We want to snapshot the Redux state of this workspace
    // The Redux state will have captured any changes made to the blocks
    // That what the next three consts are doing (until the console.log)

    const reduxBlocks = props.reduxState.blocks.blocks;

    const reduxBlocksAssociatedWithWorkspace = reduxBlocks.filter(b =>
      workspaceBlocks.find((b2: any) => b.id === b2.id),
    );

    const augmentedBlocks = reduxBlocksAssociatedWithWorkspace.map(b => ({
      id: b.id,
      type: workspaceBlocks.find((b2: any) => b.id === b2.id).type,
      value: b.value.toJSON(),
    }));

    props.createSnapshot({
      variables: {
        userId: Auth.userId(),
        assignmentId: props.currentAssignmentIdQuery.currentAssignmentId,
        workspaceId: workspace.id,
        actionType: action,
        snapshot: JSON.stringify({
          userId: Auth.userId(),
          workspaceId: workspace.id,
          workspace: augmentedBlocks.filter(b =>
            workspace.blocks.find(b2 => b.id === b2.id),
          ),
          children: _.sortBy(workspace.childWorkspaces, cw =>
            Date.parse(cw.createdAt),
          ).map(w => {
            const childBlocks = augmentedBlocks.filter(b =>
              w.blocks.find(b2 => b.id === b2.id),
            );
            return childBlocks.map(b => ({
              ...b,
              isArchived: w.isArchived,
              isForJudge: !(
                w.isEligibleForHonestOracle || w.isEligibleForMaliciousOracle
              ),
            }));
          }),
          exportLockStatusInfo: workspace.exportLockStatusInfo,
          action,
          availablePointers: this.getAvailablePointers(workspace),
        }),
      },
    });
  }

  public render() {
    const workspace = this.props.workspace.workspace;

    const questionProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceQuestion,
      workspace,
    ).blockEditorAttributes();

    const scratchpadProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceScratchpad,
      workspace,
    ).blockEditorAttributes();

    const subquestionDraftProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceSubquestionDraft,
      workspace,
    ).blockEditorAttributes();

    const answerDraftProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceAnswerDraft,
      workspace,
    ).blockEditorAttributes();

    const rootWorkspaceScratchpadProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.RootWorkspaceScratchpad,
      workspace.rootWorkspace,
    ).blockEditorAttributes();

    const isOracleWorkspace =
      workspace.isEligibleForHonestOracle ||
      workspace.isEligibleForMaliciousOracle;

    const isParentOracleWorkspace = workspace.isParentOracleWorkspace;

    const hasParent = !!workspace.parentId;

    const hasGrandparent =
      workspace.parentWorkspace && workspace.parentWorkspace.parentWorkspace;

    const grandparent =
      hasGrandparent && workspace.parentWorkspace.parentWorkspace;

    const isGrandparentRootWorkspace =
      hasGrandparent && grandparent.id === workspace.rootWorkspaceId;

    const hasGreatGrandparent =
      workspace.parentWorkspace &&
      workspace.parentWorkspace.parentWorkspace &&
      workspace.parentWorkspace.parentWorkspace.parentWorkspace;

    const greatGrandparent =
      hasGreatGrandparent &&
      workspace.parentWorkspace.parentWorkspace.parentWorkspace;

    const isGreatGrandparentRootWorkspace =
      hasGreatGrandparent && greatGrandparent.id === workspace.rootWorkspaceId;

    const isRequestingLazyUnlock = workspace.isRequestingLazyUnlock;

    const oracleAnswerCandidateProps: any =
      isOracleWorkspace &&
      hasParent &&
      !isRequestingLazyUnlock &&
      new WorkspaceBlockRelation(
        WorkspaceRelationTypes.WorkspaceOracleAnswerCandidate,
        workspace,
      ).blockEditorAttributes();

    const hasSubquestions = workspace.childWorkspaces.length > 0;
    const isUserOracle = workspace.isUserOracleForTree;
    const isUserMaliciousOracle = workspace.isUserMaliciousOracleForTree;
    const isInOracleMode = this.props.oracleModeQuery.oracleMode;

    const hasTimeBudget = workspace.hasTimeBudgetOfRootParent;
    const hasIOConstraints = workspace.hasIOConstraintsOfRootParent;

    const isInExperiment = getIsUserInExperimentFromQueryParams(
      window.location.search,
    );

    const isIsolatedWorkspace = isInExperiment;

    const isActive =
      workspace.currentlyActiveUser &&
      workspace.currentlyActiveUser.id === Auth.userId();

    const experimentId = getExperimentIdOrSerialIdFromQueryParams(
      window.location.search,
    );

    const hasURLTimeRestriction = getDoesWorkspaceHaveTimerFromQueryParams(
      window.location.search,
    );
    const hasTimerEnded = this.state.hasTimerEnded;

    const durationInMsGivenRemainingBudget =
      (Number(workspace.totalBudget) - Number(workspace.allocatedBudget)) *
      1000;

    const DEFAULT_MAX_TIMER_DURATION = 90 * 1000;

    const durationInMsGivenURLRestriction = hasURLTimeRestriction
      ? getMomentDurationForWorkspaceTimerFromQueryParams(
          window.location.search,
        ).asMilliseconds()
      : DEFAULT_MAX_TIMER_DURATION;

    const durationInMs = Math.min(
      durationInMsGivenRemainingBudget,
      durationInMsGivenURLRestriction,
    );

    const exportLockStatusInfo = workspace.exportLockStatusInfo;
    const unlockPointer = pointerId =>
      this.props.unlockPointerMutation({
        variables: {
          pointerId,
          workspaceId: workspace.id,
        },
      });

    const visibleExportIds = this.props.exportingPointers.map(
      p => p.data.pointerId,
    );

    const isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly = workspace.rootWorkspace.tree.experiments.some(
      e => e.areNewWorkspacesOracleOnlyByDefault,
    );
    const isWorkspacePartOfOracleExperiment = isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly;

    const shouldShowResponseField =
      !isWorkspacePartOfOracleExperiment ||
      !isOracleWorkspace ||
      !hasParent ||
      isRequestingLazyUnlock;

    const shouldShowTwoButtonResponseUI =
      isWorkspacePartOfOracleExperiment &&
      !isOracleWorkspace &&
      isParentOracleWorkspace;

    // This (rootWorkspaceScratchPad) is included in expert workspaces.
    // The purpose of including this in expert workspaces
    // is to ensure that the expert always has access to essential information
    // (such as the URL for an associated text). All such essential information
    // should be included by the experiment creator in the root workspace
    // scratchpad.
    const rootWorkspaceScratchPad = workspace.rootWorkspace.blocks.find(
      b => b.type === "SCRATCHPAD",
    );

    // If the scratchpad value contains pointers or links,
    // then it will contain more than one node.
    //
    // If it contains nothing but plain text, then it will contain
    // only one node.
    //
    // We want to avoid showing the scratchpad in certain cases, and
    // all of these cases are when the scratchpad contains nothing
    // but plain text (and therefore just one node).
    const numNodesInRootWorkspaceScratchpadValue = _.get(
      rootWorkspaceScratchPad,
      "value[0].nodes.length",
    );

    const doesRootWorkspaceScratchpadValueContainMoreThanOneNode =
      numNodesInRootWorkspaceScratchpadValue > 1;

    const doesRootWorkspaceScratchpadValueContainExactlyOneNode =
      numNodesInRootWorkspaceScratchpadValue === 1;

    const rootWorkspaceScratchpadFirstText = _.get(
      rootWorkspaceScratchPad,
      "value[0].nodes[0].leaves[0].text",
    );

    const isRootWorkspaceScratchpadFirstTextEmpty =
      typeof rootWorkspaceScratchpadFirstText === "string" &&
      rootWorkspaceScratchpadFirstText.trim() === "";

    const isRootWorkspaceScratchpadFirstTextDefaultValue =
      typeof rootWorkspaceScratchpadFirstText === "string" &&
      rootWorkspaceScratchpadFirstText.trim().toLowerCase() ===
        "root-level scratchpad";

    // The scratchpad content is relevant if either it contains >1 node or
    // it contains only one node that's non-empty and non-default.
    const doesRootWorkspaceScratchpadContainRelevantContent =
      doesRootWorkspaceScratchpadValueContainMoreThanOneNode ||
      (doesRootWorkspaceScratchpadValueContainExactlyOneNode &&
        !isRootWorkspaceScratchpadFirstTextEmpty &&
        !isRootWorkspaceScratchpadFirstTextDefaultValue);

    // The root workspace scratchpad will be included
    // in any non-root expert workspace.
    // (It's of course already included in the root workspace.)
    const shouldShowRootWorkspaceScratchpad =
      hasParent &&
      isOracleWorkspace &&
      doesRootWorkspaceScratchpadContainRelevantContent;

    const availablePointers = shouldShowRootWorkspaceScratchpad
      ? this.getAvailablePointers(workspace, rootWorkspaceScratchPad)
      : this.getAvailablePointers(workspace);

    const shouldShowJudgeTextFromScratchpad =
      hasParent &&
      !isOracleWorkspace &&
      doesRootWorkspaceScratchpadContainRelevantContent;

    const judgeRegex = /<judge>(.*)<\/judge>/;
    const judgeTextArray = judgeRegex.exec(
      listOfSlateNodesToText(_.get(rootWorkspaceScratchPad, "value"), false),
    );
    const judgeText = judgeTextArray ? judgeTextArray[1] : null;

    return (
      <div>
        <Helmet>
          <title>
            Workspace{" "}
            {Value.fromJSON(questionProps.initialValue).document.text.slice(
              0,
              20,
            )}{" "}
            - Mosaic
          </title>
        </Helmet>
        <div
          style={{ display: this.state.hasInitiallyLoaded ? "none" : "block" }}
        >
          <ContentContainer>Optimizing workspace...</ContentContainer>
        </div>
        <div
          style={{ display: this.state.hasInitiallyLoaded ? "block" : "none" }}
        >
          {this.state.isAuthenticated && experimentId && (
            <EpisodeNav
              snapshot={(action: string) => this.snapshot(this.props, action)}
              experimentId={experimentId}
              hasSubquestions={hasSubquestions}
              isActive={isActive}
              isInOracleMode={isInOracleMode}
              isUserOracle={isUserOracle}
              isUserMaliciousOracle={isUserMaliciousOracle}
              hasTimeBudget={hasTimeBudget}
              hasTimerEnded={hasTimerEnded}
              markAsNotStaleRelativeToUser={() =>
                this.props.updateWorkspaceIsStaleRelativeToUser({
                  variables: {
                    workspaceId: workspace.id,
                    isStale: false,
                  },
                })
              }
              updateIsEligibleForOracle={isEligibleForHonestOracle =>
                this.props.updateWorkspace({
                  variables: {
                    id: workspace.id,
                    input: {
                      isEligibleForHonestOracle,
                    },
                  },
                })
              }
            />
          )}
          <ContentContainer>
            {hasTimerEnded ? (
              <div>
                Your time with this workspace is up. Thanks for contributing!
              </div>
            ) : (
              <div key={workspace.id}>
                <BlockHoverMenu>
                  <Row>
                    <Col sm={12}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          minHeight: "60px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            minHeight: "60px",
                          }}
                        >
                          {isWorkspacePartOfOracleExperiment && (
                            <DepthDisplay
                              depth={workspace.depth}
                              depthLimit={
                                workspace.rootWorkspace.tree.depthLimit
                              }
                            />
                          )}
                          {hasIOConstraints &&
                          !(isUserOracle && isInOracleMode) ? (
                            <CharCountDisplays
                              inputCharCount={this.props.inputCharCount}
                              outputCharCount={this.props.outputCharCount}
                            />
                          ) : (
                            <div />
                          )}
                        </div>
                        {hasTimeBudget ? (
                          <TimerAndTimeBudgetInfo
                            isActive={isActive}
                            durationInMs={durationInMs}
                            handleTimerEnd={this.handleTimerEnd}
                            initialAllocatedBudget={workspace.allocatedBudget}
                            tickDuration={this.tickDurationForCountdownTimer}
                            totalBudget={workspace.totalBudget}
                            workspaceId={workspace.id}
                          />
                        ) : (
                          <TimerWhenNoTimeBudget
                            isActive={isActive}
                            tickDuration={
                              this
                                .tickDurationForUpdatingTimeSpentWhenNoTimeBudget
                            }
                            workspaceId={workspace.id}
                          />
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: workspaceViewQuestionFontSize,
                            marginRight: "8px",
                          }}
                        >
                          <span style={{ color: "darkGray" }}>
                            Workspace #{workspace.serialId}
                          </span>
                          {shouldShowRootWorkspaceScratchpad && (
                            <div
                              style={{
                                fontSize: "18px",
                                marginBottom: "20px",
                                minWidth: "550px",
                              }}
                            >
                              <BlockEditor
                                isActive={isActive}
                                isUserOracle={isUserOracle}
                                availablePointers={availablePointers}
                                {...rootWorkspaceScratchpadProps}
                              />
                            </div>
                          )}
                          {shouldShowJudgeTextFromScratchpad && (
                            <div
                              style={{
                                fontSize: "18px",
                                marginBottom: "20px",
                                minWidth: "550px",
                              }}
                            >
                              <p>{judgeText}</p>
                            </div>
                          )}
                          <BlockEditor
                            isActive={isActive}
                            isUserOracle={isUserOracle}
                            availablePointers={availablePointers}
                            exportLockStatusInfo={exportLockStatusInfo}
                            visibleExportIds={visibleExportIds}
                            unlockPointer={unlockPointer}
                            {...questionProps}
                            shouldAutosave={
                              !isActive && Auth.isAdmin() ? true : false
                            }
                            shouldAutoExport={
                              !isActive &&
                              Auth.isAdmin() &&
                              this.state.shouldAutoExport
                            }
                            pastedExportFormat={
                              !isActive &&
                              Auth.isAdmin() &&
                              this.state.pastedExportFormat
                            }
                            idOfHonestAnswerCandidate={
                              workspace.idOfHonestAnswerCandidate
                            }
                            idOfMaliciousAnswerCandidate={
                              workspace.idOfMaliciousAnswerCandidate
                            }
                            isAwaitingHonestExpertDecision={
                              workspace.isAwaitingHonestExpertDecision
                            }
                          />
                          <div style={{ marginTop: "6px" }}>
                            {hasParent && !isIsolatedWorkspace && (
                              <ParentLink
                                parentSerialId={workspace.parentSerialId}
                              />
                            )}
                            {workspace.isAwaitingHonestExpertDecision && (
                              <GreatGrandParentLink
                                greatGrandParentSerialId={
                                  workspace.parentWorkspace.parentWorkspace
                                    .parentWorkspace.serialId
                                }
                              />
                            )}
                            {workspace && !isIsolatedWorkspace && (
                              <SubtreeLink workspace={workspace} />
                            )}
                            {workspace && (
                              <React.Fragment>
                                {(isUserMaliciousOracle ||
                                  (Auth.isAdmin() && !isActive)) && (
                                  <span style={{ marginRight: "10px" }}>
                                    <RootTreeLink workspace={workspace} />
                                  </span>
                                )}
                                <ExpandAllPointersBtn />
                              </React.Fragment>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {workspace.isAwaitingHonestExpertDecision && (
                    <HonestExpertDecisionBtns
                      experimentId={experimentId}
                      snapshot={(action: string) =>
                        this.snapshot(this.props, action)
                      }
                      concedeToMalicious={() =>
                        this.props.concedeToMalicious({
                          variables: { id: workspace.id },
                        })
                      }
                      playOutSubtree={() =>
                        this.props.playOutSubtree({
                          variables: { id: workspace.id },
                        })
                      }
                      markAsNotStale={() =>
                        this.props.updateWorkspace({
                          variables: {
                            id: workspace.id,
                            input: {
                              isStale: false,
                            },
                          },
                        })
                      }
                      isGreatGrandparentRootWorkspace={
                        isGreatGrandparentRootWorkspace
                      }
                    />
                  )}

                  {!workspace.isAwaitingHonestExpertDecision && (
                    <Row>
                      <Col sm={6}>
                        {!this.state.isAuthenticated && experimentId && (
                          <Alert
                            bsStyle="danger"
                            style={{ border: "1px solid #ddd" }}
                          >
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: 600,
                                paddingBottom: "10px",
                                textAlign: "center",
                              }}
                            >
                              !
                            </div>
                            <div style={{ textAlign: "center" }}>
                              You are currently <strong>not</strong> logged in,
                              and are unable to participate in this workspace.
                              If you've been logged out, try logging back in
                              with the link at the top of the page.
                            </div>
                          </Alert>
                        )}
                        {this.state.isAuthenticated && !isActive && (
                          <Alert
                            bsStyle="danger"
                            style={{ border: "1px solid #ddd" }}
                          >
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: 600,
                                paddingBottom: "10px",
                                textAlign: "center",
                              }}
                            >
                              !
                            </div>
                            <div style={{ textAlign: "center" }}>
                              You are currently <strong>not</strong> assigned to
                              this workspace. If you are looking for an
                              assignment, navigate back to the main experiment
                              page and rejoin the experiment.
                            </div>
                          </Alert>
                        )}
                        {!(this.state.isAuthenticated && !isActive) &&
                          workspace.message && (
                            <Alert style={{ border: "1px solid #ddd" }}>
                              {hasParent &&
                              workspace.childWorkspaces &&
                              workspace.childWorkspaces.length > 0 ? (
                                <span style={{ color: "#666" }}>
                                  <span
                                    style={{
                                      color: "red",
                                      fontWeight: 600,
                                      paddingRight: "10px",
                                    }}
                                  >
                                    !
                                  </span>
                                  Please email developer Zak Miller at{" "}
                                  <a href="mailto:name@mydomain.com">
                                    zak@ought.org
                                  </a>{" "}
                                  to let him know you've seen this message.
                                  Please include the workspace # in your email.
                                  This issue should be resolved in the next few
                                  days. Thanks for your patience!
                                </span>
                              ) : (
                                <ReactMarkdown source={workspace.message} />
                              )}
                            </Alert>
                          )}

                        {!(
                          isOracleWorkspace &&
                          hasParent &&
                          !isRequestingLazyUnlock
                        ) && (
                          <BlockContainer>
                            <BlockHeader>Scratchpad</BlockHeader>
                            <BlockBody>
                              <BlockEditor
                                isActive={isActive}
                                isUserOracle={isUserOracle}
                                availablePointers={availablePointers}
                                visibleExportIds={visibleExportIds}
                                exportLockStatusInfo={exportLockStatusInfo}
                                placeholder="Text for the scratchpad..."
                                unlockPointer={unlockPointer}
                                cyAttributeName="slate-editor-scratchpad"
                                shouldAutoExport={this.state.shouldAutoExport}
                                pastedExportFormat={
                                  this.state.pastedExportFormat
                                }
                                {...scratchpadProps}
                              />
                            </BlockBody>
                          </BlockContainer>
                        )}

                        {shouldShowResponseField &&
                          !shouldShowTwoButtonResponseUI && (
                            <BlockContainer>
                              <BlockHeader>Response</BlockHeader>
                              <BlockBody>
                                <BlockEditor
                                  isActive={isActive}
                                  isUserOracle={isUserOracle}
                                  availablePointers={availablePointers}
                                  visibleExportIds={visibleExportIds}
                                  exportLockStatusInfo={exportLockStatusInfo}
                                  placeholder="Text for the answer..."
                                  unlockPointer={unlockPointer}
                                  cyAttributeName="slate-editor-response"
                                  shouldAutoExport={this.state.shouldAutoExport}
                                  pastedExportFormat={
                                    this.state.pastedExportFormat
                                  }
                                  {...answerDraftProps}
                                />
                              </BlockBody>
                              {this.state.isAuthenticated && isActive && (
                                <ResponseFooter
                                  snapshot={(action: string) =>
                                    this.snapshot(this.props, action)
                                  }
                                  isUserMaliciousOracle={isUserMaliciousOracle}
                                  isRequestingLazyUnlock={
                                    isRequestingLazyUnlock
                                  }
                                  hasChildren={
                                    workspace.childWorkspaces.length > 0
                                  }
                                  experimentId={experimentId}
                                  hasTimeBudget={hasTimeBudget}
                                  depleteBudget={() =>
                                    this.props.depleteBudget({
                                      variables: { id: workspace.id },
                                    })
                                  }
                                  hasParent={hasParent}
                                  isInOracleMode={isInOracleMode}
                                  isUserOracle={isUserOracle}
                                  markAsAnsweredByOracle={() =>
                                    this.props.updateWorkspace({
                                      variables: {
                                        id: workspace.id,
                                        input: {
                                          wasAnsweredByOracle: true,
                                        },
                                      },
                                    })
                                  }
                                  markAsCurrentlyResolved={() =>
                                    this.props.updateWorkspace({
                                      variables: {
                                        id: workspace.id,
                                        input: {
                                          isCurrentlyResolved: true,
                                        },
                                      },
                                    })
                                  }
                                  markAsNotStale={() =>
                                    this.props.updateWorkspace({
                                      variables: {
                                        id: workspace.id,
                                        input: {
                                          isStale: false,
                                        },
                                      },
                                    })
                                  }
                                  declineToChallenge={() =>
                                    this.props.declineToChallengeMutation({
                                      variables: { id: workspace.id },
                                    })
                                  }
                                  transferRemainingBudgetToParent={() =>
                                    this.props.transferRemainingBudgetToParent({
                                      variables: { id: workspace.id },
                                    })
                                  }
                                  workspaceId={workspace.id}
                                  responseBlockId={answerDraftProps.blockId}
                                />
                              )}
                            </BlockContainer>
                          )}
                        {shouldShowResponseField &&
                          shouldShowTwoButtonResponseUI && (
                            <BlockContainer>
                              <BlockHeader>Select Answer</BlockHeader>
                              <BlockBody>
                                <div
                                  style={{
                                    alignItems: "center",
                                    display: "flex",
                                    justifyContent: "space-around",
                                  }}
                                >
                                  <SelectAnswerBtn
                                    experimentId={experimentId}
                                    markAsCurrentlyResolved={() =>
                                      this.props.updateWorkspace({
                                        variables: {
                                          id: workspace.id,
                                          input: {
                                            isCurrentlyResolved: true,
                                          },
                                        },
                                      })
                                    }
                                    markAsNotStale={() =>
                                      this.props.updateWorkspace({
                                        variables: {
                                          id: workspace.id,
                                          input: {
                                            isStale: false,
                                          },
                                        },
                                      })
                                    }
                                    selectAnswerCandidate={() =>
                                      this.props.selectAnswerCandidate({
                                        variables: {
                                          id: workspace.id,
                                          decision: 1,
                                        },
                                      })
                                    }
                                    snapshot={() =>
                                      this.snapshot(this.props, "SELECT_A1")
                                    }
                                  >
                                    Select A1
                                  </SelectAnswerBtn>
                                  <SelectAnswerBtn
                                    experimentId={experimentId}
                                    markAsCurrentlyResolved={() =>
                                      this.props.updateWorkspace({
                                        variables: {
                                          id: workspace.id,
                                          input: {
                                            isCurrentlyResolved: true,
                                          },
                                        },
                                      })
                                    }
                                    markAsNotStale={() =>
                                      this.props.updateWorkspace({
                                        variables: {
                                          id: workspace.id,
                                          input: {
                                            isStale: false,
                                          },
                                        },
                                      })
                                    }
                                    selectAnswerCandidate={() =>
                                      this.props.selectAnswerCandidate({
                                        variables: {
                                          id: workspace.id,
                                          decision: 2,
                                        },
                                      })
                                    }
                                    snapshot={() =>
                                      this.snapshot(this.props, "SELECT_A2")
                                    }
                                  >
                                    Select A2
                                  </SelectAnswerBtn>
                                </div>
                              </BlockBody>
                            </BlockContainer>
                          )}

                        {this.state.isAuthenticated && (
                          <AdvancedOptions
                            shouldAutoExport={this.state.shouldAutoExport}
                            handleShouldAutoExportToggle={
                              this.handleShouldAutoExportToggle
                            }
                            pastedExportFormat={this.state.pastedExportFormat}
                            handlePastedExportFormatChange={
                              this.handlePastedExportFormatChange
                            }
                          />
                        )}
                      </Col>
                      <Col sm={6}>
                        {!(
                          isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly &&
                          isRequestingLazyUnlock
                        ) && (
                          <React.Fragment>
                            {isOracleWorkspace &&
                              hasParent &&
                              !isRequestingLazyUnlock && (
                                <React.Fragment>
                                  <BlockContainer>
                                    <BlockHeader>Scratchpad</BlockHeader>
                                    <BlockBody>
                                      <BlockEditor
                                        isActive={isActive}
                                        isUserOracle={isUserOracle}
                                        availablePointers={availablePointers}
                                        visibleExportIds={visibleExportIds}
                                        exportLockStatusInfo={
                                          exportLockStatusInfo
                                        }
                                        placeholder="Text for the scratchpad..."
                                        unlockPointer={unlockPointer}
                                        cyAttributeName="slate-editor-scratchpad"
                                        shouldAutoExport={
                                          this.state.shouldAutoExport
                                        }
                                        pastedExportFormat={
                                          this.state.pastedExportFormat
                                        }
                                        {...scratchpadProps}
                                      />
                                    </BlockBody>
                                  </BlockContainer>
                                  <BlockContainer>
                                    <BlockHeader>Answer Candidate</BlockHeader>
                                    <BlockBody>
                                      <BlockEditor
                                        shouldShowCharCount={true}
                                        isActive={isActive}
                                        isUserOracle={isUserOracle}
                                        availablePointers={availablePointers}
                                        visibleExportIds={visibleExportIds}
                                        exportLockStatusInfo={
                                          exportLockStatusInfo
                                        }
                                        placeholder="Text for the answer candidate..."
                                        unlockPointer={unlockPointer}
                                        cyAttributeName="slate-editor-scratchpad"
                                        shouldAutoExport={
                                          this.state.shouldAutoExport
                                        }
                                        pastedExportFormat={
                                          this.state.pastedExportFormat
                                        }
                                        {...oracleAnswerCandidateProps}
                                      />
                                    </BlockBody>
                                    {isUserOracle && hasParent && (
                                      <OracleAnswerCandidateFooter
                                        isGrandparentRootWorkspace={
                                          isGrandparentRootWorkspace
                                        }
                                        snapshot={(action: string) =>
                                          this.snapshot(this.props, action)
                                        }
                                        isUserMaliciousOracle={
                                          isUserMaliciousOracle
                                        }
                                        isRequestingLazyUnlock={
                                          isRequestingLazyUnlock
                                        }
                                        hasChildren={
                                          workspace.childWorkspaces.length > 0
                                        }
                                        experimentId={experimentId}
                                        hasTimeBudget={hasTimeBudget}
                                        depleteBudget={() =>
                                          this.props.depleteBudget({
                                            variables: { id: workspace.id },
                                          })
                                        }
                                        hasParent={hasParent}
                                        isInOracleMode={isInOracleMode}
                                        isUserOracle={isUserOracle}
                                        markAsAnsweredByOracle={() =>
                                          this.props.updateWorkspace({
                                            variables: {
                                              id: workspace.id,
                                              input: {
                                                wasAnsweredByOracle: true,
                                              },
                                            },
                                          })
                                        }
                                        markAsCurrentlyResolved={() =>
                                          this.props.updateWorkspace({
                                            variables: {
                                              id: workspace.id,
                                              input: {
                                                isCurrentlyResolved: true,
                                              },
                                            },
                                          })
                                        }
                                        markAsNotStale={() =>
                                          this.props.updateWorkspace({
                                            variables: {
                                              id: workspace.id,
                                              input: {
                                                isStale: false,
                                              },
                                            },
                                          })
                                        }
                                        declineToChallenge={() =>
                                          this.props.declineToChallengeMutation(
                                            {
                                              variables: { id: workspace.id },
                                            },
                                          )
                                        }
                                        transferRemainingBudgetToParent={() =>
                                          this.props.transferRemainingBudgetToParent(
                                            {
                                              variables: { id: workspace.id },
                                            },
                                          )
                                        }
                                        workspaceId={workspace.id}
                                        blockId={
                                          oracleAnswerCandidateProps.blockId
                                        }
                                      />
                                    )}
                                  </BlockContainer>
                                </React.Fragment>
                              )}
                            {!(
                              isOracleWorkspace &&
                              hasParent &&
                              !isRequestingLazyUnlock
                            ) && (
                              <ChildrenSidebar
                                isMIBWithoutRestarts={
                                  workspace.rootWorkspace.tree
                                    .isMIBWithoutRestarts
                                }
                                snapshot={(action: string) =>
                                  this.snapshot(this.props, action)
                                }
                                doesAllowOracleBypass={
                                  workspace.rootWorkspace.tree
                                    .doesAllowOracleBypass
                                }
                                isWorkspacePartOfOracleExperiment={
                                  isWorkspacePartOfOracleExperiment
                                }
                                isUserOracle={isUserOracle}
                                experimentId={experimentId}
                                pastedExportFormat={
                                  this.state.pastedExportFormat
                                }
                                shouldAutoExport={this.state.shouldAutoExport}
                                hasTimeBudget={hasTimeBudget}
                                visibleExportIds={visibleExportIds}
                                exportLockStatusInfo={exportLockStatusInfo}
                                unlockPointer={unlockPointer}
                                isActive={isActive}
                                isInOracleMode={isInOracleMode}
                                subquestionDraftProps={subquestionDraftProps}
                                isIsolatedWorkspace={isIsolatedWorkspace}
                                workspace={workspace}
                                workspaces={workspace.childWorkspaces}
                                availablePointers={availablePointers}
                                onCreateChild={({
                                  question,
                                  totalBudget,
                                  shouldOverrideToNormalUser,
                                }) => {
                                  this.props.createChild({
                                    variables: {
                                      workspaceId: workspace.id,
                                      question,
                                      shouldOverrideToNormalUser,
                                      totalBudget,
                                    },
                                  });
                                }}
                                onUpdateChildTotalBudget={({
                                  childId,
                                  totalBudget,
                                }) => {
                                  this.props.updateChildTotalBudget({
                                    variables: {
                                      workspaceId: workspace.id,
                                      childId,
                                      totalBudget,
                                    },
                                  });
                                }}
                                availableBudget={
                                  workspace.totalBudget -
                                  workspace.allocatedBudget
                                }
                                parentTotalBudget={workspace.totalBudget}
                                updateWorkspaceIsArchived={({
                                  isArchived,
                                  workspaceId,
                                }) => {
                                  this.props.updateWorkspace({
                                    variables: {
                                      id: workspaceId,
                                      input: {
                                        isArchived,
                                      },
                                    },
                                  });
                                }}
                                updateIsEligibleForOracle={({
                                  isEligibleForHonestOracle,
                                  workspaceId,
                                }) => {
                                  this.props.updateWorkspace({
                                    variables: {
                                      id: workspaceId,
                                      input: {
                                        isEligibleForHonestOracle,
                                      },
                                    },
                                  });
                                }}
                                markAsNotStale={() =>
                                  this.props.updateWorkspace({
                                    variables: {
                                      id: workspace.id,
                                      input: {
                                        isStale: false,
                                      },
                                    },
                                  })
                                }
                                ref={input => {
                                  if (input && input.editor()) {
                                    this.newChildField = input.editor();
                                  }
                                }}
                              />
                            )}
                          </React.Fragment>
                        )}
                      </Col>
                    </Row>
                  )}
                </BlockHoverMenu>
              </div>
            )}
          </ContentContainer>
        </div>
      </div>
    );
  }

  private handleShouldAutoExportToggle = () =>
    this.setState({ shouldAutoExport: !this.state.shouldAutoExport });

  private leaveCurrentWorkspace = () => {
    const isInExperiment = this.experimentId;

    if (isInExperiment) {
      this.props.leaveCurrentWorkspaceMutation({
        variables: {
          experimentId: this.experimentId,
        },
      });
    }
  };

  private handlePastedExportFormatChange = (value: any) => {
    this.setState({
      pastedExportFormat: value,
    });
  };

  private updateAuthenticationState() {
    if (Auth.isAuthenticated()) {
      this.setState({
        isAuthenticated: true,
      });
    } else {
      this.setState({ isAuthenticated: false });
    }
  }
}

export class WorkspaceQuery extends React.Component<any, any> {
  public render() {
    const isLoading = this.props.workspace.loading;

    if (isLoading) {
      return <ContentContainer>Fetching workspace data...</ContentContainer>;
    }

    const workspace = this.props.workspace.workspace;

    if (!workspace) {
      return <ContentContainer>Workspace not found...</ContentContainer>;
    }

    return <WorkspaceView {...this.props} />;
  }
}

const options: any = ({ match }) => ({
  variables: { id: match.params.workspaceId },
  policy: "network-only",
});

function visibleBlockIds(workspace: any) {
  if (!workspace) {
    return [];
  }
  const directBlockIds = workspace.blocks.map(b => b.id);
  const childBlockIds = _.flatten(
    workspace.childWorkspaces.map(w =>
      w.blocks.filter(b => b.type !== "SCRATCHPAD"),
    ),
  ).map((b: any) => b.id);

  return [...directBlockIds, ...childBlockIds];
}

function getNewQuestionFormBlockId(state: any, workspace: any) {
  if (!workspace) {
    return [];
  }

  const block = state.blocks.blocks.find(b => b.workspaceId === workspace.id);
  return block && block.id;
}

function mapStateToProps(state: any, { workspace }: any) {
  const _visibleBlockIds = visibleBlockIds(workspace.workspace);
  const newQuestionFormBlockId = getNewQuestionFormBlockId(
    state,
    workspace.workspace,
  );
  const allBlockIds = [..._visibleBlockIds, newQuestionFormBlockId];
  const exportingPointers: any = exportingBlocksPointersSelector(allBlockIds)(
    state,
  );

  let inputCharCount, outputCharCount;
  if (workspace.workspace) {
    const visibleExportIds = exportingPointers.map(p => p.data.pointerId);

    const exportLockStatusInfo = workspace.workspace.exportLockStatusInfo;

    const connectedPointers = _.uniqBy(
      workspace.workspace.connectedPointers,
      (p: any) => p.data.pointerId,
    );

    const question = workspace.workspace.blocks.find(
      b => b.type === "QUESTION",
    );

    const subquestionAnswers = _.flatten(
      workspace.workspace.childWorkspaces.map(w =>
        w.blocks.filter(b => b.type === "ANSWER"),
      ),
    );

    const inputBlocks = [question, ...subquestionAnswers];

    const inputBlockIds = inputBlocks.map((b: any) => b.id);

    inputCharCount = inputCharCountSelector({
      state,
      inputBlockIds,
      connectedPointers,
      exportingPointers,
      visibleExportIds,
      exportLockStatusInfo,
    });

    const scratchpad = workspace.workspace.blocks.find(
      b => b.type === "SCRATCHPAD",
    );
    const answer = workspace.workspace.blocks.find(b => b.type === "ANSWER");
    const subquestionDraft = workspace.workspace.blocks.find(
      b => b.type === "SUBQUESTION_DRAFT",
    );

    const subquestionQuestions = _.flatten(
      workspace.workspace.childWorkspaces.map(w =>
        w.blocks.filter(b => b.type === "QUESTION"),
      ),
    );

    const outputBlocks = [
      scratchpad,
      answer,
      subquestionDraft,
      ...subquestionQuestions,
    ];

    const outputBlockIds = outputBlocks.map((b: any) => b.id);

    outputCharCount = outputCharCountSelector(state, outputBlockIds);
  }

  const { blocks } = state;
  return {
    reduxState: state,
    blocks,
    exportingPointers,
    inputCharCount,
    outputCharCount,
  };
}

const LEAVE_CURRENT_WORKSPACE_MUTATION = gql`
  mutation leaveCurrentWorkspace($experimentId: String) {
    leaveCurrentWorkspace(experimentId: $experimentId)
  }
`;

const UNLOCK_POINTER_MUTATION = gql`
  mutation unlockPointerMutation($pointerId: String, $workspaceId: String) {
    unlockPointer(pointerId: $pointerId, workspaceId: $workspaceId)
  }
`;

const UPDATE_WORKSPACE_IS_STALE_REALTIVE_TO_USER = gql`
  mutation updateWorkspaceIsStaleRelativeToUser(
    $isStale: Boolean
    $workspaceId: String
  ) {
    updateWorkspaceIsStaleRelativeToUser(
      isStale: $isStale
      workspaceId: $workspaceId
    ) {
      id
    }
  }
`;

const DECLINE_TO_CHALLENGE_MUTATION = gql`
  mutation declineToChallengeMutation($id: String) {
    declineToChallenge(id: $id)
  }
`;

const CONCEDE_TO_MALICIOUS = gql`
  mutation condeceToMalicious($id: String) {
    concedeToMalicious(id: $id)
  }
`;

const PLAY_OUT_SUBTREE = gql`
  mutation playOutSubtree($id: String) {
    playOutSubtree(id: $id)
  }
`;

const CREATE_SNAPSHOT_MUTATION = gql`
  mutation createSnapshotMutation(
    $userId: String
    $workspaceId: String
    $assignmentId: String
    $actionType: String
    $snapshot: String
  ) {
    createSnapshot(
      userId: $userId
      workspaceId: $workspaceId
      assignmentId: $assignmentId
      actionType: $actionType
      snapshot: $snapshot
    )
  }
`;

const SELECT_ANSWER_CANDIDATE = gql`
  mutation selectAnswerCandidate($id: String, $decision: Int) {
    selectAnswerCandidate(id: $id, decision: $decision)
  }
`;

const CURRENT_ASSIGNMENT_ID_QUERY = gql`
  query currentAssignmentId(
    $experimentId: String
    $userId: String
    $workspaceId: String
  ) {
    currentAssignmentId(
      experimentId: $experimentId
      userId: $userId
      workspaceId: $workspaceId
    )
  }
`;

export const EpisodeShowPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspace", options }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
  graphql(LEAVE_CURRENT_WORKSPACE_MUTATION, {
    name: "leaveCurrentWorkspaceMutation",
  }),
  graphql(NEW_CHILD, {
    name: "createChild",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(UPDATE_CHILD_TOTAL_BUDGET, {
    name: "updateChildTotalBudget",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(UPDATE_WORKSPACE, {
    name: "updateWorkspace",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(TRANSFER_REMAINING_BUDGET_TO_PARENT, {
    name: "transferRemainingBudgetToParent",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(DEPLETE_BUDGET, {
    name: "depleteBudget",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
  graphql(UPDATE_WORKSPACE_IS_STALE_REALTIVE_TO_USER, {
    name: "updateWorkspaceIsStaleRelativeToUser",
  }),
  graphql(DECLINE_TO_CHALLENGE_MUTATION, {
    name: "declineToChallengeMutation",
  }),
  graphql(UNLOCK_POINTER_MUTATION, {
    name: "unlockPointerMutation",
    options: {
      refetchQueries: ["workspace"],
    },
  }),
  graphql(CREATE_SNAPSHOT_MUTATION, {
    name: "createSnapshot",
  }),
  graphql(CONCEDE_TO_MALICIOUS, {
    name: "concedeToMalicious",
  }),
  graphql(PLAY_OUT_SUBTREE, {
    name: "playOutSubtree",
  }),
  graphql(SELECT_ANSWER_CANDIDATE, {
    name: "selectAnswerCandidate",
  }),
  graphql(CURRENT_ASSIGNMENT_ID_QUERY, {
    name: "currentAssignmentIdQuery",
    options: ({ match }: any) => ({
      variables: {
        experimentId: getExperimentIdOrSerialIdFromQueryParams(
          window.location.search,
        ),
        userId: Auth.userId(),
        workspaceId: match.params.workspaceId,
      },
    }),
  }),
  connect(
    mapStateToProps,
    { addBlocks, saveBlocks, expandAllImports, closeAllPointerReferences },
  ),
)(WorkspaceQuery);
