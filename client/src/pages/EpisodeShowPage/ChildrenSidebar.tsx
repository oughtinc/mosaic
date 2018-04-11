import * as React from "react";
import styled from "styled-components";
import { Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import { WorkspaceBlockRelation, WorkspaceRelationTypes } from "./WorkspaceRelations";
import { ChildBudgetForm } from "./ChildBudgetForm";

const ChildStyle = styled.div`
    border: 2px solid #ddd;
    padding: 1em;
    margin-bottom: 1em;
    float: left;
    width: 100%;
`;

export class Child extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = { showChildBudgetForm: false };
    }

    public render() {
        const workspace = this.props.workspace;
        const availablePointers = this.props.availablePointers;
        const questionRelationship = new WorkspaceBlockRelation(WorkspaceRelationTypes.SubworkspaceQuestion, workspace);
        const answerRelationship = new WorkspaceBlockRelation(WorkspaceRelationTypes.SubworkspaceAnswer, workspace);
        return (
            <ChildStyle>
                {questionRelationship.findBlock().value &&
                    <BlockEditor
                        {...questionRelationship.blockEditorAttributes()}
                        editingWorkspaceId={this.props.editingWorkspaceId}
                        availablePointers={availablePointers}
                    />
                }

                {answerRelationship.findBlock().value &&
                    <BlockEditor
                        {...answerRelationship.blockEditorAttributes()}
                        editingWorkspaceId={this.props.editingWorkspaceId}
                        availablePointers={availablePointers}
                    />
                }

                <div>
                    <Link to={`/workspaces/${workspace.id}`}>
                        <Button> Open </Button>
                    </Link>
                    <Button onClick={this.props.onDelete}>
                        Archive
                </Button>
                    {!this.state.showChildBudgetForm &&
                        <Button onClick={() => { this.setState({ showChildBudgetForm: true }); }}>
                            Edit Allocation
                    </Button>
                    }
                    <div style={{ float: "right" }}>
                        <Badge>{workspace.totalBudget - workspace.allocatedBudget} / {workspace.totalBudget}</Badge>
                    </div>
                </div>
                {this.state.showChildBudgetForm &&
                    <ChildBudgetForm
                        initialValue={workspace.totalBudget}
                        min={workspace.allocatedBudget}
                        max={parseInt(workspace.totalBudget, 10) + parseInt(this.props.parentAvailableBudget, 10)}
                        onSubmit={(totalBudget) => { this.props.onUpdateChildTotalBudget({ childId: workspace.id, totalBudget }); }}
                        onClose={() => this.setState({ showChildBudgetForm: false })}
                    />
                }
            </ChildStyle>
        );
    }
}

export class ChildrenSidebar extends React.Component<any, any> {
    private newChildField;

    public editor = () => {
        return this.newChildField && this.newChildField.editor();
    }

    public render() {
        return (
            <div>
                {!!this.props.workspaceOrder.length &&
                    <div>
                        <h3> Existing Children </h3>
                        {this.props.workspaceOrder.map((workspaceId) => {
                            const workspace = this.props.workspaces.find((w) => w.id === workspaceId);
                            return (
                                <Child
                                    editingWorkspaceId={this.props.editingWorkspaceId}
                                    workspace={workspace}
                                    key={workspace.id}
                                    onDelete={() => { this.props.changeOrder(this.props.workspaceOrder.filter((w) => w !== workspace.id)); }}
                                    availablePointers={this.props.availablePointers}
                                    parentAvailableBudget={this.props.availableBudget}
                                    onUpdateChildTotalBudget={this.props.onUpdateChildTotalBudget}
                                />
                            );
                        }
                        )}
                    </div>
                }
                <h3> Add a new Child Question </h3>
                <NewBlockForm
                    maxTotalBudget={this.props.availableBudget}
                    onMutate={this.props.onCreateChild}
                    availablePointers={this.props.availablePointers}
                    ref={(input) => { this.newChildField = input; }}
                />
            </div>
        );
    }
}
