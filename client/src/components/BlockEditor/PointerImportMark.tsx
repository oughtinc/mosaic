import * as React from "react";
import * as uuidv1 from "uuid/v1";
import styled from "styled-components";
import ReactDOM = require("react-dom");

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

export class PointerImportMark extends React.Component<any, any> {
    public inner;
    public constructor(props: any) {
        super(props);
        this.state = { isOpen: false };
        this.innerRef = this.innerRef.bind(this);
    }

    public innerRef(menu: any) {
        console.log("Here", menu);
        this.inner = menu;
    }

    public getLocation() {
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        console.log("bounds", rect);
        return {top: `${rect.top - 30}px`, left: `${rect.left}px`};
    }

    public render() {
        console.log("import", this.props);
        if (!this.state.isOpen) {
            return (
                <ClosedPointerImport
                    onClick={() => { this.setState({ isOpen: !this.state.isOpen }); }}
                    onMouseOver={() => this.props.onHover(this.getLocation())}
                    onMouseOut={() => {console.log("Mouse out"); }}
                >
                <span ref={this.innerRef}>
                $1
                </span>
                </ClosedPointerImport>
            );
        } else {
            return (
                <OpenPointerImport onClick={() => { this.setState({ isOpen: !this.state.isOpen }); }}>
                    This is a very funny sentence that will go right here...
                </OpenPointerImport>
            );
        }
    }
}