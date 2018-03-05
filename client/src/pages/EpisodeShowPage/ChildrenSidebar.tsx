import * as React from "react";
import { Editor } from 'slate-react';
import { type, Node, Value } from 'slate';
import styled from 'styled-components';
import { Form, Field } from "react-final-form";
import Plain from 'slate-plain-serializer';
import { BlockEditor } from "./BlockEditor";

class ChildForm extends React.Component<any, any> {
    public render() {
        const onSubmit = async (values) => {
            this.props.onMutate(JSON.stringify(values['new'].toJSON()))
        }
        return (
            <Form
                onSubmit={onSubmit}
                initialValues={{ 'new': Plain.deserialize("") }}
                render={({ handleSubmit, reset, submitting, pristine, values }) => (
                    <div>

                        <form onSubmit={handleSubmit}>
                            <BlockEditor
                                name={'new'}
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
        )
    }
}

const ChildStyle = styled.div`
  border: 1px solid #ddd;
  padding: 3px;
  margin-bottom: 3px;
`

export class Child extends React.Component<any, any> {
    public render() {
        const question = this.props.workspace.blocks.find(b => (b.type === "QUESTION"))
        return (
            <ChildStyle>
                {question.value &&
                    <BlockEditor
                        isInField={false}
                        value={Value.fromJSON(question.value)}
                    />
                }
            </ChildStyle>
        )
    }
}
export class ChildrenSidebar extends React.Component<any, any> {
    public render() {
        return (
            <div>
                {this.props.workspaces.length &&
                    <div>
                        <h3> Existing Children </h3>
                        {this.props.workspaces.map(workspace => (
                            <Child workspace={workspace} key={workspace.id} />
                        ))}
                    </div>
                }
                <h3> Add a new Question </h3>
                <ChildForm onMutate={this.props.onCreateChild} />
            </div>
        )
    }
}