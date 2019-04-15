import * as moment from "moment";
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
import { parse as parseQueryString } from "query-string";
import { AdvancedOptions } from "./AdvancedOptions";
import { DepthDisplay } from "./DepthDisplay";
import { EpisodeNav } from "./EpisodeNav";
import { ResponseFooter } from "./ResponseFooter";
import { CharCountDisplays } from "./CharCountDisplays";
import { TimerAndTimeBudgetInfo } from "./TimerAndTimeBudgetInfo";
import { TimerWhenNoTimeBudget } from "./TimerWhenNoTimeBudget";
import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { expandAllImports, closeAllPointerReferences } from "../../modules/blockEditor/actions";
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

import {
  ORACLE_MODE_QUERY,
  UPDATE_BLOCKS,
  UPDATE_WORKSPACE,
} from "../../graphqlQueries";
import {
  CONVERT_PASTED_EXPORT_TO_IMPORT
} from "../../constants";
import { Auth } from "../../auth";

import {
  blockBorderAndBoxShadow,
  blockHeaderCSS,
  blockBodyCSS,
  workspaceViewQuestionFontSize
} from "../../styles";

const WORKSPACE_QUERY = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      parentId
      creatorId
      isPublic
      isStale
      isEligibleForHonestOracle
      isUserOracleForTree
      isUserMaliciousOracleForTree
      isRequestingLazyUnlock
      rootWorkspaceId
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
        createdAt
        totalBudget
        creatorId
        isArchived
        isEligibleForHonestOracle
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
        tree {
          id
          experiments {
            id
            areNewWorkspacesOracleOnlyByDefault
          }
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
    $totalBudget: Int
  ) {
    createChildWorkspace(
      workspaceId: $workspaceId
      question: $question
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
  <NavLink to={`/workspaces/${props.parentId}`}>
    <Button bsStyle="default" bsSize="xsmall">
      Parent »
    </Button>
  </NavLink>
);

const RootTreeLink = ({ workspace }) => (
  <NavLink target="_blank" to={`/workspaces/${workspace.rootWorkspaceId}/subtree?expanded=true&activeWorkspace=${workspace.id}`}>
    <Button bsStyle="default" bsSize="xsmall">
      Entire Tree »
    </Button>
  </NavLink>
);

const SubtreeLink = ({ workspace }) => (
  <NavLink to={`/workspaces/${workspace.id}/subtree`}>
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
    };
  }

  public async componentDidMount() {
    this.experimentId = parseQueryString(window.location.search).experiment;

    window.addEventListener("beforeunload", e => {
      setTimeout(() => {
        const isLeavingWorkspacePage = /^\/workspaces\//.test(window.location.pathname);
        if (isLeavingWorkspacePage) {
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
  }

  public componentWillUnmount() {
    this.leaveCurrentWorkspace();
  }

  public updateBlocks = (blocks: any) => {
    const variables = { blocks };
    this.props.updateBlocks({
      variables,
    });
  };

  public handleTimerEnd = () => {
    this.setState({
      hasTimerEnded: true
    });
  };

  public render() {
    const workspace = this.props.workspace.workspace;

    const importedPointers = workspace.connectedPointers;

    const allReadOnlyBlocks = new WorkspaceWithRelations(
      workspace
    ).allReadOnlyBlocks();

    let readOnlyExportedPointers = [];
    try {
      readOnlyExportedPointers = _.flatten(
        allReadOnlyBlocks.map(b => findPointers(b.value))
      );
    } catch (err) {
      // @ts-ignore
      if (window.FS) {
        // @ts-ignore
        window.FS.log("error", err.toString());
      } else {
        console.log(err);
      }
    }

    const unsortedAvailablePointers = _.uniqBy(
      [
        ...this.props.exportingPointers,
        ...importedPointers,
        ...readOnlyExportedPointers
      ],
      p => p.data.pointerId
    );

    const availablePointers = _.orderBy(
      unsortedAvailablePointers,
      ["data.pointerId"],
      ["asc"]
    );

    const questionProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceQuestion,
      workspace
    ).blockEditorAttributes();
    const scratchpadProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceScratchpad,
      workspace
    ).blockEditorAttributes();
    const subquestionDraftProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceSubquestionDraft,
      workspace
    ).blockEditorAttributes();
    const answerDraftProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceAnswerDraft,
      workspace
    ).blockEditorAttributes();

    const hasParent = !!workspace.parentId;
    const hasSubquestions = workspace.childWorkspaces.length > 0;
    const isUserOracle = workspace.isUserOracleForTree;
    const isUserMaliciousOracle = workspace.isUserMaliciousOracleForTree;
    const isInOracleMode = this.props.oracleModeQuery.oracleMode;

    const hasTimeBudget = workspace.hasTimeBudgetOfRootParent;
    const hasIOConstraints = workspace.hasIOConstraintsOfRootParent;

    const queryParams = parseQueryString(window.location.search);
    const isIsolatedWorkspace = queryParams.isolated === "true";
    const isActive = workspace.currentlyActiveUser && workspace.currentlyActiveUser.id === Auth.userId();
    const experimentId = queryParams.experiment;
    const hasURLTimeRestriction = queryParams.timer;
    const hasTimerEnded = this.state.hasTimerEnded;

    const durationInMsGivenRemainingBudget = (Number(workspace.totalBudget) - Number(workspace.allocatedBudget)) * 1000;

    const DEFAULT_MAX_TIMER_DURATION = 90 * 1000;
    const durationInMsGivenURLRestriction = hasURLTimeRestriction ? moment.duration(queryParams.timer).asMilliseconds() : DEFAULT_MAX_TIMER_DURATION;

    const durationInMs = Math.min(durationInMsGivenRemainingBudget, durationInMsGivenURLRestriction);

    const exportLockStatusInfo = workspace.exportLockStatusInfo;
    const unlockPointer = pointerId => this.props.unlockPointerMutation({
      variables: {
        pointerId,
        workspaceId: workspace.id,
      }
    });

    const visibleExportIds = this.props.exportingPointers.map(p => p.data.pointerId);

    const isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly = workspace.rootWorkspace.tree.experiments.some(e => e.areNewWorkspacesOracleOnlyByDefault);
    const isWorkspacePartOfOracleExperiment = isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly;

    const isRequestingLazyUnlock = workspace.isRequestingLazyUnlock;

    return (
      <div>
        <Helmet>
          <title>
            Workspace {Value.fromJSON(questionProps.initialValue).document.text.slice(0, 20)} - Mosaic
          </title>
        </Helmet>
        <div
          style={{ display: this.state.hasInitiallyLoaded ? "none" : "block"}}
        >
          <ContentContainer>Optimizing workspace...</ContentContainer>
        </div>
        <div
          style={{ display: this.state.hasInitiallyLoaded ? "block" : "none"}}
        >
          {Auth.isAuthenticated() && experimentId && (
            <EpisodeNav
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
                    }
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
                          {
                            isWorkspacePartOfOracleExperiment
                            &&
                            <DepthDisplay depth={workspace.depth} />
                          }
                          {
                            hasIOConstraints && !(isUserOracle && isInOracleMode)
                            ?
                            <CharCountDisplays
                              inputCharCount={this.props.inputCharCount}
                              outputCharCount={this.props.outputCharCount}
                            />
                            :
                            <div />
                          }
                        </div>
                        {
                          hasTimeBudget
                          ?
                          <TimerAndTimeBudgetInfo
                            isActive={isActive}
                            durationInMs={durationInMs}
                            handleTimerEnd={this.handleTimerEnd}
                            initialAllocatedBudget={workspace.allocatedBudget}
                            tickDuration={this.tickDurationForCountdownTimer}
                            totalBudget={workspace.totalBudget}
                            workspaceId={workspace.id}
                          />
                          :
                          <TimerWhenNoTimeBudget
                            isActive={isActive}
                            tickDuration={this.tickDurationForUpdatingTimeSpentWhenNoTimeBudget}
                            workspaceId={workspace.id}
                          />
                        }
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          marginBottom: "10px"
                        }}
                      >
                        <div
                          style={{
                            fontSize: workspaceViewQuestionFontSize,
                            marginRight: "8px"
                          }}
                        >
                          <BlockEditor
                            isActive={isActive}
                            isUserOracle={isUserOracle}
                            availablePointers={availablePointers}
                            exportLockStatusInfo={exportLockStatusInfo}
                            visibleExportIds={visibleExportIds}
                            unlockPointer={unlockPointer}
                            {...questionProps}
                            shouldAutosave={(!isActive && Auth.isAdmin()) ? true : false}
                            shouldAutoExport={(!isActive && Auth.isAdmin()) && this.state.shouldAutoExport}
                            pastedExportFormat={(!isActive && Auth.isAdmin()) && this.state.pastedExportFormat}
                          />
                        </div>
                      </div>
                      <div>
                        {hasParent &&
                          !isIsolatedWorkspace && (
                            <span style={{ display: "inline-block", marginBottom: "12px" }}>
                              <ParentLink parentId={workspace.parentId} />
                            </span>
                          )}
                        {workspace && !isIsolatedWorkspace &&
                          <span style={{ display: "inline-block", marginBottom: "12px" }}>
                            <SubtreeLink workspace={workspace} />
                          </span>
                        }
                        {workspace &&
                          (
                            ((isUserOracle && isInOracleMode) || (Auth.isAdmin() && !isActive))
                            &&
                            <span style={{ display: "inline-block", marginBottom: "12px" }}>
                              <RootTreeLink workspace={workspace} />
                              <ExpandAllPointersBtn />
                            </span>
                          )
                        }
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      {
                        Auth.isAuthenticated()
                        &&
                        !isActive
                        &&
                        <Alert bsStyle="danger" style={{ border: "1px solid #ddd"}}>
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
                          <div
                            style={{ textAlign: "center" }}
                          >
                             You are currently <strong>not</strong> assigned to this workspace. If you are looking for an assignment, navigate back to the main experiment page and rejoin the experiment.
                          </div>
                        </Alert>
                      }
                      {
                        !(
                          Auth.isAuthenticated()
                          &&
                          !isActive
                        )
                        &&
                        workspace.message
                        &&
                        <Alert style={{ border: "1px solid #ddd"}}>
                          <ReactMarkdown source={workspace.message} />
                        </Alert>
                      }
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
                            pastedExportFormat={this.state.pastedExportFormat}
                            {...scratchpadProps}
                          />
                        </BlockBody>
                      </BlockContainer>

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
                            pastedExportFormat={this.state.pastedExportFormat}
                            {...answerDraftProps}
                          />
                        </BlockBody>
                        {
                          Auth.isAuthenticated()
                          &&
                          isActive
                          &&
                          <ResponseFooter
                            isUserMaliciousOracle={isUserMaliciousOracle}
                            isRequestingLazyUnlock={isRequestingLazyUnlock}
                            hasChildren={workspace.childWorkspaces.length > 0}
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
                                }
                              })
                            }
                            declineToChallenge={() =>
                              this.props.declineToChallengeMutation({
                                variables: { id: workspace.id }
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
                        }
                      </BlockContainer>

                      {
                        Auth.isAuthenticated()
                        &&
                        <AdvancedOptions 
                          shouldAutoExport={this.state.shouldAutoExport}
                          handleShouldAutoExportToggle={this.handleShouldAutoExportToggle}
                          pastedExportFormat={this.state.pastedExportFormat}
                          handlePastedExportFormatChange={this.handlePastedExportFormatChange}
                        />
                      }
                    </Col>
                    <Col sm={6}>
                    {
                      !(
                        isWorkspacePartOfExperimentWhereSomeNewWorkspacesOracleOnly
                        &&
                        isRequestingLazyUnlock
                      )
                      &&
                      <ChildrenSidebar
                        isUserOracle={isUserOracle}
                        experimentId={experimentId}
                        pastedExportFormat={this.state.pastedExportFormat}
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
                        onCreateChild={({ question, totalBudget }) => {
                          this.props.createChild({
                            variables: {
                              workspaceId: workspace.id,
                              question,
                              totalBudget,
                            }
                          });
                        }}
                        onUpdateChildTotalBudget={({ childId, totalBudget }) => {
                          this.props.updateChildTotalBudget({
                            variables: {
                              workspaceId: workspace.id,
                              childId,
                              totalBudget
                            }
                          });
                        }}
                        availableBudget={
                          workspace.totalBudget - workspace.allocatedBudget
                        }
                        parentTotalBudget={
                          workspace.totalBudget
                        }
                        updateWorkspaceIsArchived={({ isArchived, workspaceId }) => {
                          this.props.updateWorkspace({
                            variables: {
                              id: workspaceId,
                              input: {
                                isArchived
                              },
                            }
                          });
                        }}
                        updateIsEligibleForOracle={({ isEligibleForHonestOracle, workspaceId }) => {
                          this.props.updateWorkspace({
                            variables: {
                              id: workspaceId,
                              input: {
                                isEligibleForHonestOracle
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
                            }
                          })}
                        ref={input => {
                          if (input && input.editor()) {
                            this.newChildField = input.editor();
                          }
                        }}
                      />
                    }
                    </Col>
                  </Row>
                </BlockHoverMenu>
              </div>
            )}
          </ContentContainer>
        </div>
      </div>
    );
  }

  private handleShouldAutoExportToggle = () => this.setState({ shouldAutoExport: !this.state.shouldAutoExport });

  private leaveCurrentWorkspace = () => {
    const isInExperiment = this.experimentId;

    if (isInExperiment) {
      this.props.leaveCurrentWorkspaceMutation({
        variables: {
          experimentId: this.experimentId,
        },
      });
    }
  }

  private handlePastedExportFormatChange = (value: any) => {
    this.setState({
      pastedExportFormat: value,
    });
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

    return (
      <WorkspaceView
        {...this.props}
      />
    );
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
  const childBlockIds = _
    .flatten(
      workspace.childWorkspaces.map(w =>
        w.blocks.filter(b => b.type !== "SCRATCHPAD")
      )
    )
    .map((b: any) => b.id);
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
    workspace.workspace
  );
  const allBlockIds = [..._visibleBlockIds, newQuestionFormBlockId];
  const exportingPointers: any = exportingBlocksPointersSelector(allBlockIds)(state);

  let inputCharCount, outputCharCount;
  if (workspace.workspace) {
    const visibleExportIds = exportingPointers.map(p => p.data.pointerId);

    const exportLockStatusInfo = workspace.workspace.exportLockStatusInfo;

    const connectedPointers = _.uniqBy(
      workspace.workspace.connectedPointers,
      (p: any) => p.data.pointerId
    );

    const question = workspace.workspace.blocks.find(b =>
      b.type === "QUESTION"
    );

    const subquestionAnswers = _.flatten(
      workspace.workspace.childWorkspaces.map(w =>
        w.blocks.filter(b => b.type === "ANSWER")
      )
    );

    const inputBlocks = [question, ...subquestionAnswers];

    const inputBlockIds = inputBlocks.map((b: any) => b.id);

    inputCharCount = inputCharCountSelector({
      state,
      inputBlockIds,
      connectedPointers,
      exportingPointers,
      visibleExportIds,
      exportLockStatusInfo
    });

    const scratchpad = workspace.workspace.blocks.find(b => b.type === "SCRATCHPAD");
    const answer = workspace.workspace.blocks.find(b => b.type === "ANSWER");
    const subquestionDraft = workspace.workspace.blocks.find(b => b.type === "SUBQUESTION_DRAFT");

    const subquestionQuestions = _.flatten(
      workspace.workspace.childWorkspaces.map(w =>
        w.blocks.filter(b => b.type === "QUESTION")
      )
    );

    const outputBlocks = [
      scratchpad,
      answer,
      subquestionDraft,
      ...subquestionQuestions
    ];

    const outputBlockIds = outputBlocks.map((b: any) => b.id);

    outputCharCount = outputCharCountSelector(state, outputBlockIds);
  }

  const { blocks } = state;
  return { blocks, exportingPointers, inputCharCount, outputCharCount };
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
  mutation updateWorkspaceIsStaleRelativeToUser($isStale: Boolean, $workspaceId: String) {
    updateWorkspaceIsStaleRelativeToUser(isStale: $isStale, workspaceId: $workspaceId) {
      id
    }
  }
`;

const DECLINE_TO_CHALLENGE_MUTATION = gql`
  mutation declineToChallengeMutation($id: String) {
    declineToChallenge(id: $id)
  }
`;

export const EpisodeShowPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspace", options }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
  graphql(LEAVE_CURRENT_WORKSPACE_MUTATION, { name: "leaveCurrentWorkspaceMutation" }),
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
      refetchQueries: ["workspace"]
    }
  }),
  graphql(TRANSFER_REMAINING_BUDGET_TO_PARENT, {
    name: "transferRemainingBudgetToParent",
    options: {
      refetchQueries: ["workspace"]
    }
  }),
  graphql(DEPLETE_BUDGET, {
    name: "depleteBudget",
    options: {
      refetchQueries: ["workspace"]
    }
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
      refetchQueries: ["workspace"]
    }
  }),
  connect(
    mapStateToProps,
    { addBlocks, saveBlocks, expandAllImports, closeAllPointerReferences }
  )
)(WorkspaceQuery);
