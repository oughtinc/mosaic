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
    padding-bottom: 11px;
    padding-top: 8px;
`;

const Column1 = styled.div`
    flex: 6;
    display: flex;
    flex-direction: column;
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
    padding: "5px",
    fontSize: "12px",
    lineHeight: "1.3",
    marginLeft: "3px",
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
                        <Button bsSize="small" style={iconStyle}>
                            <FontAwesomeIcon icon={faShare} />
                        </Button>
                    </Link>
                    <Button bsSize="small" onClick={() => { this.setState({ isEditing: !this.state.isEditing }); }} style={iconStyle}>
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button bsSize="small" onClick={this.props.onDelete} style={iconStyle}>
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
                <ChildStyle style={{border: "none"}}>
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
                                <Button bsSize="small">
                                    Create New Subquestion
                                </Button>
                            </span>
                        </TopRow>
                        {/* <BottomRow>
                            <div style={{float: "left"}}>
                            </div>
                        </BottomRow> */}
                    </Column1>
                    <Column2/>
                </ChildStyle>
            </div>
        );
    }
}
