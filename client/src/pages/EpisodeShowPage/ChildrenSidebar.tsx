import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import { WorkspaceBlockRelation, WorkspaceRelationTypes } from "./WorkspaceRelations";
// import { WorkspaceRelationTypes } from "./WorkspaceRelations";

const ChildStyle = styled.div`
    border: 2px solid #ddd;
    padding: 1em;
    margin-bottom: 1em;
`;

export class Child extends React.Component<any, any> {
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
                        availablePointers={availablePointers}
                    />
                }

                {answerRelationship.findBlock().value &&
                    <BlockEditor
                        {...answerRelationship.blockEditorAttributes()}
                        availablePointers={availablePointers}
                    />
                }

                <Link to={`/workspaces/${workspace.id}`}>
                    <Button> Open </Button>
                </Link>
                <Button onClick={this.props.onDelete}>
                    Archive
                </Button>
            </ChildStyle>
        );
    }
}

export class ChildrenSidebar extends React.Component<any, any> {
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
                                    workspace={workspace}
                                    key={workspace.id}
                                    onDelete={() => { this.props.changeOrder(this.props.workspaceOrder.filter((w) => w !== workspace.id)); }}
                                    availablePointers={this.props.availablePointers}
                                />
                            );
                        }
                        )}
                    </div>
                }
                <h3> Add a new Child Question </h3>
                <NewBlockForm
                    onMutate={this.props.onCreateChild}
                    availablePointers={this.props.availablePointers}
                />
            </div>
        );
    }
}
