import * as React from "react";
import styled from "styled-components";
import { Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import { WorkspaceBlockRelation, WorkspaceRelationTypes } from "./WorkspaceRelations";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faShare = require("@fortawesome/fontawesome-free-solid/faShare");
import faTimes = require("@fortawesome/fontawesome-free-solid/faTimes");
import faEdit = require("@fortawesome/fontawesome-free-solid/faEdit");

const ChildStyle = styled.div`
    background: #f4f4f4;
    border: 1px solid #ddd;
    margin-bottom: 1em;
    padding: 2px;
    border-radius: 3px;
`;

const iconStyle = {
    width: "30px",
    marginBottom: "3px",
    padding: "0",
    fontSize: "10px",
    lineHeight: "1.3",
};

export class Child extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = { isEditing: false };
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
                        availablePointers={availablePointers}
                        readOnly={!this.state.isEditing}
                        shouldAutosave={this.state.isEditing}
                    />
                }
                <div style={{ marginBottom: "3px" }} />
                {answerRelationship.findBlock().value &&
                    <BlockEditor
                        {...answerRelationship.blockEditorAttributes()}
                        availablePointers={availablePointers}
                    />
                }
                <Link to={`/workspaces/${workspace.id}`}>
                    <Button bsSize="xsmall" style={iconStyle}>
                        <FontAwesomeIcon icon={faShare} />
                    </Button>
                </Link>
                <Button bsSize="xsmall" onClick={() => { this.setState({ isEditing: !this.state.isEditing }); }} style={iconStyle}>
                    <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button bsSize="xsmall" onClick={this.props.onDelete} style={iconStyle}>
                    <FontAwesomeIcon icon={faTimes} />
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
