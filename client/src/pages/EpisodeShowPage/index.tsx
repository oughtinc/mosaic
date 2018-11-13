import * as LogRocket from "logrocket";
import * as moment from "moment";
import * as React from "react";
import * as keyboardJS from "keyboardjs";

import gql from "graphql-tag";
import styled from "styled-components";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import { parse as parseQueryString } from "query-string";

import { EpisodeNav } from "./EpisodeNav";
import { TimerAndTimeBudgetInfo } from "./TimerAndTimeBudgetInfo";
import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { ContentContainer } from "../../components/ContentContainer";
import {
  exportingBlocksPointersSelector,
  exportingNodes,
} from "../../modules/blocks/exportingPointers";
import Plain from "slate-plain-serializer";
import * as _ from "lodash";
import { Value } from "slate";
import {
  WorkspaceRelationTypes,
  WorkspaceBlockRelation,
  WorkspaceWithRelations,
} from "./WorkspaceRelations";
import { UPDATE_BLOCKS } from "../../graphqlQueries";
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
      childWorkspaceOrder
      connectedPointers
      totalBudget
      allocatedBudget
      childWorkspaces {
        id
        totalBudget
        creatorId
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
    }
  }
`;

const UPDATE_WORKSPACE = gql`
  mutation updateWorkspaceChildren(
    $id: String!
    $childWorkspaceOrder: [String]
  ) {
    updateWorkspaceChildren(
      id: $id
      childWorkspaceOrder: $childWorkspaceOrder
    ) {
      id
    }
  }
`;

const UPDATE_WORKSPACE_STALENESS = gql`
  mutation updateWorkspaceStaleness($id: String!, $isStale: Boolean!) {
    updateWorkspaceStaleness(id: $id, isStale: $isStale) {
      id
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
  private scratchpadField;
  private answerField;
  private newChildField;
  private tickDuration = 1;

  public constructor(props: any) {
    super(props);
    this.state = {
      hasTimerEnded: false
    };
  }

  public componentDidMount() {
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
      LogRocket.captureException(err);
    }

    const availablePointers = _.uniqBy(
      [
        ...this.props.exportingPointers,
        ...importedPointers,
        ...readOnlyExportedPointers
      ],
      p => p.data.pointerId
    );

    const questionProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceQuestion,
      workspace
    ).blockEditorAttributes();
    const scratchpadProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceScratchpad,
      workspace
    ).blockEditorAttributes();
    const answerProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceAnswer,
      workspace
    ).blockEditorAttributes();
    const subquestionDraftProps = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.WorkspaceSubquestionDraft,
      workspace
    ).blockEditorAttributes();

    const queryParams = parseQueryString(window.location.search);
    const isIsolatedWorkspace = queryParams.isolated === "true";
    const hasTimer = queryParams.timer;

    const durationInMsGivenRemainingBudget = (Number(workspace.totalBudget) - Number(workspace.allocatedBudget)) * 1000;
    const durationInMsGivenURLRestriction = moment.duration(queryParams.timer).asMilliseconds();
    const durationInMs = Math.min(durationInMsGivenRemainingBudget, durationInMsGivenURLRestriction);

    return (
      <div>
        {Auth.isAuthenticated() && (
          <EpisodeNav
            hasParent={!!workspace.parentId}
            hasTimer={hasTimer}
            hasTimerEnded={this.state.hasTimerEnded}
            updateStaleness={isStale =>
              this.props.updateWorkspaceStaleness({
                variables: { id: workspace.id, isStale }
              })
            }
            transferRemainingBudgetToParent={() =>
              this.props.transferRemainingBudgetToParent({
                variables: { id: workspace.id }
              })
            }
          />
        )}
        <ContentContainer>
          {this.state.hasTimerEnded ? (
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
                        justifyContent: "flex-end",
                      }}
                    >
                      <TimerAndTimeBudgetInfo
                        durationInMs={durationInMs}
                        handleTimerEnd={this.handleTimerEnd}
                        hasTimer={hasTimer}
                        initialAllocatedBudget={workspace.allocatedBudget}
                        tickDuration={this.tickDuration}
                        totalBudget={workspace.totalBudget}
                        workspaceId={workspace.id}
                      />
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
                          availablePointers={availablePointers}
                          {...questionProps}
                        />
                      </div>
                      {workspace.parentId &&
                        !isIsolatedWorkspace && (
                          <div style={{ paddingBottom: "8px" }}>
                            <ParentLink parentId={workspace.parentId} />
                          </div>
                        )}
                      {workspace &&
                        !isIsolatedWorkspace && (
                          <div style={{ paddingBottom: "8px" }}>
                            <SubtreeLink workspace={workspace} />
                          </div>
                        )}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    <BlockContainer>
                      <BlockHeader>Scratchpad</BlockHeader>
                      <BlockBody>
                        <BlockEditor
                          availablePointers={availablePointers}
                          placeholder="Text for the scratchpad..."
                          {...scratchpadProps}
                        />
                      </BlockBody>
                    </BlockContainer>

                    <BlockContainer>
                      <BlockHeader>Response</BlockHeader>
                      <BlockBody>
                        <BlockEditor
                          availablePointers={availablePointers}
                          placeholder="Text for the answer..."
                          {...answerProps}
                        />
                      </BlockBody>
                    </BlockContainer>
                  </Col>
                  <Col sm={6}>
                    <ChildrenSidebar
                      subquestionDraftProps={subquestionDraftProps}
                      isIsolatedWorkspace={isIsolatedWorkspace}
                      workspace={workspace}
                      workspaces={workspace.childWorkspaces}
                      availablePointers={availablePointers}
                      workspaceOrder={workspace.childWorkspaceOrder}
                      onCreateChild={({ question, totalBudget }) => {
                        this.props.createChild({
                          variables: {
                            workspaceId: workspace.id,
                            question,
                            totalBudget
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
                      changeOrder={newOrder => {
                        this.props.updateWorkspaceChildren({
                          variables: {
                            id: workspace.id,
                            childWorkspaceOrder: newOrder
                          }
                        });
                      }}
                      ref={input => {
                        if (input && input.editor()) {
                          this.newChildField = input.editor();
                        }
                      }}
                    />
                  </Col>
                </Row>
              </BlockHoverMenu>
            </div>
          )}
        </ContentContainer>
      </div>
    );
  }
}

export class WorkspaceQuery extends React.Component<any, any> {
  public render() {

    const isLoading = this.props.workspace.loading;

    if (isLoading) {
      return <ContentContainer>Loading...</ContentContainer>;
    }

    const workspace = this.props.workspace.workspace;

    if (workspace === null) {
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
  const exportingPointers = exportingBlocksPointersSelector(allBlockIds)(state);
  const { blocks } = state;
  return { blocks, exportingPointers };
}

export const EpisodeShowPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspace", options }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
  graphql(UPDATE_WORKSPACE, {
    name: "updateWorkspaceChildren",
    options: {
      refetchQueries: ["workspace"],
    },
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
  graphql(UPDATE_WORKSPACE_STALENESS, {
    name: "updateWorkspaceStaleness",
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
  connect(
    mapStateToProps,
    { addBlocks, saveBlocks }
  )
)(WorkspaceQuery);
