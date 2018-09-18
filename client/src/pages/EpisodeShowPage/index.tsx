import * as React from "react";
import gql from "graphql-tag";
import styled from "styled-components";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import { parse as parseQueryString } from "query-string";

import { AvailableBudget } from "./AvailableBudget";
import { Timer } from "./Timer";
import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import {
  exportingBlocksPointersSelector,
  exportingNodes
} from "../../modules/blocks/exportingPointers";
import Plain from "slate-plain-serializer";
import * as _ from "lodash";
import { Value } from "slate";
import {
  WorkspaceRelationTypes,
  WorkspaceBlockRelation,
  WorkspaceWithRelations
} from "./WorkspaceRelations";
import { UPDATE_BLOCKS } from "../../graphqlQueries";
import * as keyboardJS from "keyboardjs";

const WORKSPACE_QUERY = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      parentId
      creatorId
      isPublic
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
  mutation updateWorkspace($id: String!, $childWorkspaceOrder: [String]) {
    updateWorkspace(id: $id, childWorkspaceOrder: $childWorkspaceOrder) {
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

const BlockOuterContainer = styled.div`
  box-shadow: 0 8px 10px 1px rgba(0,0,0,0.035), 0 3px 14px 2px rgba(0,0,0,0.03), 0 5px 5px -3px rgba(0,0,0,0.05);
  margin-bottom: 40px;
`;

const BlockContainer = styled.div`
  background-color: #fff;
  border: 2px solid
    ${(props: { readOnly: boolean }) => (props.readOnly ? "#ddd" : "#fff")};
  padding: 5px 10px;
`;

const BlockHeader = styled.div`
  background-color: #f7f7f7;
  border-bottom: 1px solid #ddd;
  color: #111;
  font-family: "Lato";
  font-size: 18px;
  padding: 5px 10px;
`;

const ParentLink = props => (
  <NavLink to={`/workspaces/${props.parentId}`}>
    <Button>Parent</Button>
  </NavLink>
);

const SubtreeLink = ({ workspace }) => (
  <NavLink to={`/workspaces/${workspace.id}/subtree`}>
    <Button>Subtree</Button>
  </NavLink>
);

function findPointers(value: any) {
  const _value = value ? Value.fromJSON(value) : Plain.deserialize("");
  const pointers = exportingNodes(_value.document);
  return pointers;
}

export class FormPagePresentational extends React.Component<any, any> {
  private scratchpadField;
  private answerField;
  private newChildField;
  private timerInterval;

  public constructor(props: any) {
    super(props);
    this.state = {
      hasTimerEnded: false,
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

  public componentWillUnmount() {
    clearInterval(this.timerInterval);
  }

  public updateBlocks = (blocks: any) => {
    const variables = { blocks };
    this.props.updateBlocks({
      variables
    });
  };

  public handleTimerEnd = () => {
    this.setState({
      hasTimerEnded: true,
    });
  }

  public render() {
    const workspace = this.props.workspace.workspace;
    if (!workspace) {
      return <div> Loading </div>;
    }

    const importedPointers = workspace.connectedPointers;

    const allReadOnlyBlocks = new WorkspaceWithRelations(
      workspace
    ).allReadOnlyBlocks();
    const readOnlyExportedPointers = _.flatten(
      allReadOnlyBlocks.map(b => findPointers(b.value))
    );
    const availablePointers = _.uniqBy(
      [
        ...this.props.exportingPointers,
        ...importedPointers,
        ...readOnlyExportedPointers,
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

    if (this.state.hasTimerEnded) {
      return <div>Your time with this workspace is up. Thanks for contributing!</div>;
    }

    const queryParams = parseQueryString(window.location.search);
    const isIsolatedWorkspace = queryParams.isolated === "true";
    const hasTimer = queryParams.timer;
    const durationString = queryParams.timer;

    return (
      <div key={workspace.id}>
        <BlockHoverMenu>
          <Row>
            <Col sm={7}>
              {workspace.parentId && !isIsolatedWorkspace && (
                <ParentLink parentId={workspace.parentId} />
              )}
              {workspace && !isIsolatedWorkspace && <SubtreeLink workspace={workspace} />}
            </Col>
            <Col sm={2}>
              {
                hasTimer
                &&
                <Timer
                  durationString={durationString}
                  onTimerEnd={this.handleTimerEnd}
                  workspaceId={workspace.id}
                />
              }
            </Col>
            <Col sm={3}>
              <AvailableBudget
                allocatedBudget={workspace.allocatedBudget}
                totalBudget={workspace.totalBudget}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <h1>
                <BlockEditor
                  availablePointers={availablePointers}
                  {...questionProps}
                />
              </h1>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <BlockOuterContainer>
                <BlockHeader>Scratchpad</BlockHeader>
                <BlockContainer readOnly={scratchpadProps.readOnly}>
                  <BlockEditor
                    availablePointers={availablePointers}
                    ref={this.registerEditorRef("scratchpadField")}
                    {...scratchpadProps}
                  />
                </BlockContainer>
              </BlockOuterContainer>
              <BlockOuterContainer>
              <BlockHeader>Answer</BlockHeader>
                <BlockContainer readOnly={scratchpadProps.readOnly}>
                  <BlockEditor
                    availablePointers={availablePointers}
                    ref={this.registerEditorRef("answerField")}
                    {...answerProps}
                  />
                </BlockContainer>
              </BlockOuterContainer>
            </Col>
            <Col sm={6}>
              <ChildrenSidebar
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
                  this.props.updateWorkspace({
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
    );
  }

  private registerEditorRef = editorName => input => {
    const editor = _.get(input, "wrappedInstance.editor");
    if (!!editor) {
      this[editorName] = editor();
    }
  };
}

const options: any = ({ match }) => ({
  variables: { id: match.params.workspaceId }
});

function visibleBlockIds(workspace: any) {
  if (!workspace) {
    return [];
  }
  const directBlockIds = workspace.blocks.map(b => b.id);
  const childBlockIds = _.flatten(
    workspace.childWorkspaces.map(w =>
      w.blocks.filter(b => b.type !== "SCRATCHPAD")
    )
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
  const newQuestionFormBlockId = getNewQuestionFormBlockId(state, workspace.workspace);
  const allBlockIds = [ ..._visibleBlockIds, newQuestionFormBlockId];
  const exportingPointers = exportingBlocksPointersSelector(allBlockIds)(
    state
  );
  const { blocks } = state;
  return { blocks, exportingPointers };
}

export const EpisodeShowPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspace", options }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
  graphql(UPDATE_WORKSPACE, {
    name: "updateWorkspace",
    options: {
      refetchQueries: ["workspace"]
    }
  }),
  graphql(NEW_CHILD, {
    name: "createChild",
    options: {
      refetchQueries: ["workspace"]
    }
  }),
  graphql(UPDATE_CHILD_TOTAL_BUDGET, {
    name: "updateChildTotalBudget",
    options: {
      refetchQueries: ["workspace"]
    }
  }),
  connect(
    mapStateToProps,
    { addBlocks, saveBlocks }
  )
)(FormPagePresentational);
