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

const ChildrenStyle = styled.div`
`;

const ChildStyle = styled.div`
    display: flex;
    border-bottom: 1px dashed #e0e0e0;
    padding-bottom: 5px;
    padding-top: 5px;
`;

const Column1 = styled.div`
    flex: 10;
    display: flex;
    flex-direction: row;
`;

const Column2 = styled.div`
    padding-left: 8px;
    flex: 1;
`;

const TopRow = styled.div`
    flex: 6;
    display: flex;
`;

const BottomRow = styled.div`
    flex: 4;
    display: flex;
`;

const QStyle = styled.span`
    float: left;
    margin-right: 5px;
    color: #ccc9c9;
`;

const iconStyle = {
    width: "30px",
    marginBottom: "3px",
    padding: "0",
    fontSize: "10px",
    lineHeight: "1.3",
};

const NewBlockStyle = styled.div`
    float: left;
    background: #ececec;
    padding: 3px;
    width: 98%;
`;

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
                <Column1>
                    <TopRow>
                        <span style={{ flex: 1 }}>
                            <QStyle>Q:</QStyle>
                        </span>
                        <span style={{ flex: 30 }}>
                            {questionRelationship.findBlock().value &&
                                <BlockEditor
                                    {...questionRelationship.blockEditorAttributes()}
                                    availablePointers={availablePointers}
                                    readOnly={!this.state.isEditing}
                                    shouldAutosave={this.state.isEditing}
                                />
                            }
                        </span>
                    </TopRow>
                    <BottomRow>
                        <span style={{ flex: 1 }}>
                            <QStyle>A:</QStyle>
                        </span>
                        <span style={{ flex: 30 }}>
                            {answerRelationship.findBlock().value &&
                                <BlockEditor
                                    {...answerRelationship.blockEditorAttributes()}
                                    availablePointers={availablePointers}
                                />
                            }
                        </span>
                    </BottomRow>
                </Column1>
                <Column2>
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
                </Column2>
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
                        <h4> Subquestions </h4>
                        <ChildrenStyle>
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
                        </ChildrenStyle>
                    </div>
                }
                <ChildStyle>
                    <Column1>
                        <TopRow>
                            <span style={{ flex: 1 }}>
                                <QStyle>Q:</QStyle>
                            </span>
                            <span style={{ flex: 30 }}>
                                <NewBlockStyle>
                                <NewBlockForm
                                    onMutate={this.props.onCreateChild}
                                    availablePointers={this.props.availablePointers}
                                />
                                </NewBlockStyle>
                            </span>
                        </TopRow>
                        <BottomRow>
                            <div style={{float: "left"}}>
                                <Button bsSize="small">
                                    Create New Subquestion
                                </Button>
                            </div>
                        </BottomRow>
                    </Column1>
                    <Column2/>
                </ChildStyle>
            </div>
        );
    }
}
