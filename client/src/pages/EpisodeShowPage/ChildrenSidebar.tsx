import * as React from "react";
import * as _ from "lodash";
import styled from "styled-components";

import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import {
  WorkspaceBlockRelation,
  WorkspaceRelationTypes,
} from "./WorkspaceRelations";
import { ChildBudgetBadge } from "./ChildBudgetBadge";
import { ChildBudgetForm } from "./ChildBudgetForm";
import { Auth } from "../../auth";

import {
  blockBorderAndBoxShadow,
  blockBorderColor,
  blockHeaderCSS,
  blockBodyCSS,
  subQuestionAnswerFontColor,
} from "../../styles";

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

export class Child extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
    this.state = { showChildBudgetForm: false };
  }

  public render() {
    const { workspace, availablePointers } = this.props;
    const questionRelationship = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.SubworkspaceQuestion,
      workspace
    );
    const answerRelationship = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.SubworkspaceAnswer,
      workspace
    );

    return (
      <div>
        {questionRelationship.findBlock().value && (
          <BlockEditor
            {...questionRelationship.blockEditorAttributes()}
            availablePointers={availablePointers}
          />
        )}

        <div style={{ color: subQuestionAnswerFontColor, marginTop: "8px" }}>
          {answerRelationship.findBlock().value && (
            <BlockEditor
              {...answerRelationship.blockEditorAttributes()}
              availablePointers={availablePointers}
            />
          )}
        </div>

        <div style={{ marginTop: "0.5em" }}>
          {!this.props.isIsolatedWorkspace && (
            <Link to={`/workspaces/${workspace.id}`}>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                style={{ marginRight: "5px" }}
              >
                Open »
              </Button>
            </Link>
          )}
          {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
            <Button
              bsSize="xsmall"
              bsStyle="default"
              onClick={this.props.onDelete}
              style={{ marginRight: "5px" }}
            >
              Archive
            </Button>
          )}
          {!this.state.showChildBudgetForm &&
            Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
              <Button
                bsSize="xsmall"
                bsStyle="default"
                onClick={() => {
                  this.setState({ showChildBudgetForm: true });
                }}
              >
                Edit Time
              </Button>
            )}
          <div style={{ float: "right" }}>
            <ChildBudgetBadge
              remainingBudget={workspace.totalBudget - workspace.allocatedBudget}
              totalBudget={workspace.totalBudget}
            />
          </div>
        </div>
        {this.state.showChildBudgetForm && (
          <ChildBudgetForm
            initialValue={workspace.totalBudget}
            min={workspace.allocatedBudget}
            max={
              parseInt(workspace.totalBudget, 10) +
              parseInt(this.props.parentAvailableBudget, 10)
            }
            onSubmit={totalBudget => {
              this.props.onUpdateChildTotalBudget({
                childId: workspace.id,
                totalBudget,
              });
            }}
            onClose={() => this.setState({ showChildBudgetForm: false })}
          />
        )}
      </div>
    );
  }
}

export class ChildrenSidebar extends React.Component<any, any> {
  private newChildField;

  public editor = () => {
    return this.newChildField && this.newChildField.editor();
  };

  public shouldComponentUpdate(newProps: any) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(newProps.block, this.props.block) ||
      !_.isEqual(newProps.workspaceOrder, this.props.workspaceOrder) ||
      !_.isEqual(newProps.workspaces, this.props.workspaces)
    ) {
      return true;
    }
    return false;
  }

  public render() {
    return (
      <div>
        {!!this.props.workspaceOrder.length && (
          <BlockContainer>
            <BlockHeader>Subquestions</BlockHeader>
            {this.props.workspaceOrder.map((workspaceId, i, arr) => {
              const workspace = this.props.workspaces.find(
                w => w.id === workspaceId
              );
              return (
                <BlockBody
                  key={workspace.id}
                  style={{
                    borderBottom:
                      i !== arr.length - 1
                        ? `1px solid ${blockBorderColor}`
                        : "none",
                  }}
                >
                  <Child
                    isIsolatedWorkspace={this.props.isIsolatedWorkspace}
                    workspace={workspace}
                    key={workspace.id}
                    onDelete={() => {
                      this.props.changeOrder(
                        this.props.workspaceOrder.filter(
                          w => w !== workspace.id
                        )
                      );
                    }}
                    availablePointers={this.props.availablePointers}
                    parentAvailableBudget={this.props.availableBudget}
                    onUpdateChildTotalBudget={
                      this.props.onUpdateChildTotalBudget
                    }
                  />
                </BlockBody>
              );
            })}
          </BlockContainer>
        )}
        {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
          <NewBlockForm
            {...this.props.subquestionDraftProps}
            workspaceId={this.props.workspace.id}
            maxTotalBudget={this.props.availableBudget}
            onMutate={this.props.onCreateChild}
            availablePointers={this.props.availablePointers}
          />
        )}
      </div>
    );
  }
}
