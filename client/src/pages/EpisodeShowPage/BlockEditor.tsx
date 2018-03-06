import * as React from "react";
import Plain from "slate-plain-serializer";
import { Editor } from "slate-react";
import _ = require("lodash");
import { Field } from "react-final-form";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import * as uuidv1 from "uuid/v1"; 

const FormStyle = styled.div`
    background-color: #eee;
    border-radius: 2px;
    padding: 3px;
    margin-bottom: 10px;
`;

const SideThing = styled.span`
    float: right;
    padding: 2px 5px;
    background-color: #a5f8ff;
    position: relative;
    display: inline-block;
    &:before {
        content: "";
        position: absolute;
        border-right: 10px solid #a5f8ff;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        top: 2px;
        left: -9px;
    }
`;

export class PointerMark extends React.Component<any, any> {
    public render() {
        console.log(this.props.mark);
        return (
            <span>
                <span style={{backgroundColor: "#f88"}}>
                    {this.props.children}
                </span>
                <SideThing>{this.props.mark.data.pointerId} </SideThing>
            </span>
        );
    }
}

export class BlockEditor extends React.Component<any, any> {
    public updateValue(event: any, value: any) {
        event.preventDefault();
        const uuid = uuidv1();
        const change = value.change().toggleMark({type: "pointer", object: "mark", data: {pointerId: uuid} });
        console.log(change);
        return change.value;
    }

    public renderMark(props) {
        const { children, mark } = props;
        switch (mark.type) {
          case "pointer":
            return <PointerMark mark={mark.toJSON()}>{children}</PointerMark>;
          default: 
            return {children};
        }
      }

    public render() {
        if (this.props.isInField) {
            return (
                <Field
                    name={this.props.name}
                    render={({ input, meta }) => {
                        return (
                        <FormStyle>
                            {meta.touched && meta.error && <span>{meta.error}</span>}
                            <Button
                             onClick={(e) => input.onChange(this.updateValue(e, input.value))}
                            >
                                CHANGE
                            </Button>
                            <Editor
                                value={input.value}
                                onChange={(c) => { input.onChange(c.value); }}
                                renderMark={this.renderMark}
                            />
                        </FormStyle>
                        );
                    }}
                />
            );
        } else {
            return (
                <Editor
                    value={this.props.value || Plain.deserialize("")}
                    readOnly={true}
                />
            );
        }
    }
}