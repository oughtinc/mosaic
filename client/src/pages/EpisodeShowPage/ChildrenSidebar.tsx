import * as React from "react";
import { Editor } from "slate-react";
import { type, Node, Value } from "slate";
import styled from "styled-components";
import { Form, Field } from "react-final-form";
import Plain from "slate-plain-serializer";
import _ = require("lodash");
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Block } from "./Block";
import { BlockEditor } from "../../components/BlockEditor";

class ChildForm extends React.Component<any, any> {
    public render() {
        const onSubmit = async (values) => {
            this.props.onMutate(JSON.stringify(values.new.toJSON()));
        };
        return (
            <Form
                onSubmit={onSubmit}
                initialValues={{ new: Plain.deserialize("") }}
                render={({ handleSubmit, reset, submitting, pristine, values }) => (
                    <div>

                        <form onSubmit={handleSubmit}>
                            <BlockEditor
                                blockId={"new"}
                                isInField={true}
                            />
                            <div className="buttons">
                                <button type="submit" disabled={submitting || pristine}>
                                    Submit
                </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={submitting || pristine}>
                                    Reset
                </button>
                            </div>
                        </form>
                    </div>
                )}
            />
        );
    }
}

const ChildStyle = styled.div`
    border: 2px solid #ddd;
    padding: 1em;
    margin-bottom: 1em;
`;

export class Child extends React.Component<any, any> {
    public render() {
        const workspace = this.props.workspace;
        const question = workspace.blocks.find((b) => (b.type === "QUESTION"));
        const answer = workspace.blocks.find((b) => (b.type === "ANSWER"));
        return (
            <ChildStyle>
                {question.value &&
                    <BlockEditor
                        isInField={false}
                        blockId={question.id}
                    />
                }
                {answer.value &&
                    <BlockEditor
                        isInField={false}
                        blockId={answer.id}
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
                                    onDelete={() => {this.props.changeOrder(this.props.workspaceOrder.filter( (w) => w !== workspace.id)); }}
                                />
                            );
                        }
                        )}
                    </div>
                }
                <h3> Add a new Child Question </h3>
                {/* <ChildForm onMutate={this.props.onCreateChild} /> */}
            </div>
        );
    }
}
