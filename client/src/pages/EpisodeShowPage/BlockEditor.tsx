import * as React from "react";
import Plain from 'slate-plain-serializer';
import { Editor } from 'slate-react';
import _ = require("lodash");
import { Field } from "react-final-form";
import styled from 'styled-components';

const FormStyle = styled.div`
    background-color: #eee;
    border-radius: 2px;
    padding: 3px;
    margin-bottom: 10px;
`
export class BlockEditor extends React.Component<any, any> {
    public render() {
        if (this.props.isInField) {
            return (
                <Field
                    name={this.props.name}
                    render={({ input, meta }) => (
                        <FormStyle>
                            {meta.touched && meta.error && <span>{meta.error}</span>}
                            <Editor
                                value={input.value}
                                onChange={(c) => { input.onChange(c.value) }}
                            />
                        </FormStyle>
                    )}
                />
            )
        } else {
            return (
                <Editor
                    value={this.props.value || Plain.deserialize("")}
                    readOnly={true}
                />
            )
        }
    }
}