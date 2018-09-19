import * as React from "react";
import * as _ from "lodash";
import styled from "styled-components";

import { Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import {
  WorkspaceBlockRelation,
  WorkspaceRelationTypes
} from "./WorkspaceRelations";
import { ChildBudgetForm } from "./ChildBudgetForm";
import { Auth } from "../../auth";

const ChildStyle = styled.div`
  width: 100%;
`;

const ChildControls = styled.div`
  margin-top: 0.5em;
`;

const BlockOuterContainer = styled.div`
  border-radius: 3px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  margin-bottom: 25px;
`;

const BlockContainer = styled.div`
  background-color: #fff;
  border-radius: 0 0 3px 3px;
  padding: 10px;
`;

const BlockHeader = styled.div`
  background-color: #f7f7f7;
  border-bottom: 1px solid #ddd;
  border-radius: 3px 3px 0 0;
  color: #111;
  font-family: "Lato";
  font-size: 18px;
  padding: 5px 10px;
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
      <ChildStyle>
        {questionRelationship.findBlock().value && (
          <BlockEditor
            {...questionRelationship.blockEditorAttributes()}
            availablePointers={availablePointers}
          />
        )}

        {answerRelationship.findBlock().value && (
          <BlockEditor
            {...answerRelationship.blockEditorAttributes()}
            availablePointers={availablePointers}
          />
        )}

        <ChildControls>
          {
            !this.props.isIsolatedWorkspace
            &&
            <Link to={`/workspaces/${workspace.id}`}>
              <Button bsStyle="default" bsSize="xsmall" style={{marginRight: "5px"}}>Open »</Button>
            </Link>
          }
          {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
            <Button
              bsStyle="default"
              bsSize="xsmall"
              style={{marginRight: "5px"}}
              onClick={this.props.onDelete}
            >
              Archive
            </Button>
          )}
          {!this.state.showChildBudgetForm &&
            Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
              <Button
                bsStyle="default"
                bsSize="xsmall"
                onClick={() => {
                  this.setState({ showChildBudgetForm: true });
                }}
              >
                Edit Allocation
              </Button>
            )}
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
                    totalBudget
                  });
                }}
                onClose={() => this.setState({ showChildBudgetForm: false })}
              />
            )}
          <div style={{ float: "right" }}>
            <Badge>
              {workspace.totalBudget - workspace.allocatedBudget} /{" "}
              {workspace.totalBudget}
            </Badge>
          </div>
        </ChildControls>
      </ChildStyle>
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
          <div>
            <BlockOuterContainer>
              <BlockHeader>Subquestions</BlockHeader>
              {this.props.workspaceOrder.map((workspaceId, i, arr) => {
                const workspace = this.props.workspaces.find(
                  w => w.id === workspaceId
                );
                return (
                    <BlockContainer
                      style={{
                        borderBottom: i !== arr.length - 1 ? "1px solid #ddd" : "none",
                      }}
                      key={workspace.id}
                    >
                      <Child
                        isIsolatedWorkspace={this.props.isIsolatedWorkspace}
                        workspace={workspace}
                        onDelete={() => {
                          this.props.changeOrder(
                            this.props.workspaceOrder.filter(w => w !== workspace.id)
                          );
                        }}
                        availablePointers={this.props.availablePointers}
                        parentAvailableBudget={this.props.availableBudget}
                        onUpdateChildTotalBudget={this.props.onUpdateChildTotalBudget}
                      />
                    </BlockContainer>
                );
              })}
            </BlockOuterContainer>
          </div>
        )}
        {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
          <NewBlockForm
            workspaceId={this.props.workspace.id}
            maxTotalBudget={this.props.availableBudget}
            onMutate={this.props.onCreateChild}
            availablePointers={this.props.availablePointers}
            ref={input => {
              this.newChildField = input;
            }}
          />
        )}
      </div>
    );
  }
}
