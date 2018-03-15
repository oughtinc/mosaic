import * as React from "react";
import { Editor } from "slate-react";
import { type, Node, Value } from "slate";
import styled from "styled-components";
import { Form, Field } from "react-final-form";
import Plain from "slate-plain-serializer";
import _ = require("lodash");
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import * as uuidv1 from "uuid/v1";
import { NewBlockForm } from "../../components/NewBlockForm";

const ChildStyle = styled.div`
    border: 2px solid #ddd;
    padding: 1em;
    margin-bottom: 1em;
`;

export class Child extends React.Component<any, any> {
    public render() {
        const workspace = this.props.workspace;
        const availablePointers = this.props.availablePointers;
        const question = workspace.blocks.find((b) => (b.type === "QUESTION"));
        const answer = workspace.blocks.find((b) => (b.type === "ANSWER"));
        return (
            <ChildStyle>
                {question.value &&
                    <BlockEditor
                        readOnly={true}
                        blockId={question.id}
                        initialValue={question.value}
                        availablePointers={availablePointers}
                    />
                }
                {answer.value &&
                    <BlockEditor
                        readOnly={true}
                        blockId={answer.id}
                        initialValue={answer.value}
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
