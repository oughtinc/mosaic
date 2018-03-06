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
    background-color: #f88;
    position: relative;
    display: inline-block;
    &:before {
        content: "";
        position: absolute;
        border-right: 10px solid #f88;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        top: 2px;
        left: -9px;
    }
`;

export class PointerExport extends React.Component<any, any> {
    public render() {
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

const ClosedPointerImport = styled.span`
    background-color: rgba(86, 214, 252, 0.66);
    padding: 0px 7px;
    border-radius: 2px;
    font-weight: 800;
    color: #0a6e7f;
    transition: background-color color 0.8s; 
    &:hover {
        transition: background-color color 0.8s; 
        cursor: pointer;
        background-color: rgb(112, 183, 201);
        color: #044550;
    }
`;

const OpenPointerImport = styled.span`
    background-color: rgba(158, 224, 244, 0.66);
    padding: 0px 5px;
    border-radius: 2px;
    font-weight: 500;
    transition: background-color color 0.8s; 
    &:hover {
        cursor: pointer;
    }
`;

export class PointerImport extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {isOpen: false};
    }
    public render() {
        if (!this.state.isOpen) {
            return (
                    <ClosedPointerImport onClick={() => {this.setState({isOpen: !this.state.isOpen}); }}> 
                        $1
                    </ClosedPointerImport>
            );
        } else {
            return (
                <OpenPointerImport onClick={() => {this.setState({isOpen: !this.state.isOpen}); }}> 
                    This is a very funny sentence that will go right here...
                </OpenPointerImport>
            );
        }
    }
}

export class BlockEditor extends React.Component<any,  any> {
    public updateValue(event:  any, value: any) {
        event.preventDefault(); 
        const uuid = uuidv1();
        const change = value.change().toggleMark({type:  "pointerExport", object: "mark", data: {pointerId:  uuid} });
        return change.value;
    }

    public renderMark(props) {
        const {children,  mark } = props;
        switch (mark.type) {
          case "pointerExport":
            return <PointerExport mark={mark.toJSON()}>{children}</PointerExport>;
          case "pointerImport":
            return <PointerImport mark={mark.toJSON()}>{children}</PointerImport>;
          default: 
            return {children};
        }
      }

    public render() {
        if  (this.props.isInField) {
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
                            <Button
                             onClick={(event) => {
                                 const ch = input.value.change()
                                    .insertText("hi there!")
                                    .extend(0 - "hi there!".length)
                                    .addMark({type: "pointerImport", object: "mark", data: {pointerId: "sd8fjsdf8js"}});
                                 input.onChange(ch.value);
                             }}
                            >
                               Add 
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
                    renderMark={this.renderMark}
                    readOnly={true}
                />
            );
        }
    }
}