import * as React from "react";
import { Editor } from "slate-react";
import { type, Node, Value } from "slate";
import styled from "styled-components";
import { Form, Field } from "react-final-form";
import Plain from "slate-plain-serializer";
import { BlockEditor } from "./BlockEditor";
import _ = require("lodash");
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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
                                name={"new"}
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
  border: 1px solid #ddd;
  padding: 3px;
  margin-bottom: 3px;
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
                        value={Value.fromJSON(question.value)}
                    />
                }
                {answer.value &&
                    <BlockEditor
                        isInField={false}
                        value={_.isEmpty(answer.value) ? Plain.deserialize("") : Value.fromJSON(answer.value)}
                    />
                }

                <Link to={`/workspaces/${workspace.id}`}>
                    <Button> Open </Button>
                </Link>
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
                                <Child workspace={workspace} key={workspace.id} />
                            );
                        }
                        )}
                    </div>
                }
                <h3> Add a new Child Question </h3>
                <ChildForm onMutate={this.props.onCreateChild} />
            </div>
        );
    }
}