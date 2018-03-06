import * as React from "react";
import Plain from "slate-plain-serializer";
import { Editor } from "slate-react";
import _ = require("lodash");
import { Field } from "react-final-form";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import * as uuidv1 from "uuid/v1";
import ReactDOM = require("react-dom");
import { Menu } from "./Menu";
import { BlockEditor } from "../../components/BlockEditor";

const FormStyle = styled.div`
    background-color: #eee;
    border-radius: 2px;
    padding: 3px;
    margin-bottom: 10px;
`;

export class Block extends React.Component<any, any> {
    public menu;
    public render() {
        if (this.props.isInField) {
            return (
                <FormStyle>
                <Field
                    name={this.props.name}
                    render={({ input, meta }) => {
                        return (
                            <BlockEditor
                                value={input.value}
                                onChange={input.onChange}
                            />
                        );
                    }}
                />
            </FormStyle>
            );
        } else {
            return (
                <BlockEditor
                    value={this.props.value || Plain.deserialize("")}
                    readOnly={true}
                />
            );
        }
    }
}