import * as React from "react";
import * as uuidv1 from "uuid/v1";
import styled from "styled-components";
import ReactDOM = require("react-dom");
import { changeHoverItem } from "../../modules/blockEditor/actions";
import { connect } from "react-redux";
import { compose } from "recompose";

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

class PointerImportMarkPresentational extends React.Component<any, any> {
    public inner;
    public constructor(props: any) {
        super(props);
        this.innerRef = this.innerRef.bind(this);
    }

    public innerRef(menu: any) {
        this.inner = menu;
    }

    public getLocation() {
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        return {top: `${rect.top - 80}px`, left: `${rect.left}px`};
    }

    public render() {
        const {internalReferenceId} = this.props.mark.data;
        const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
        const isOpen = reference && reference.isOpen;
        if (!isOpen) {
            return (
                <ClosedPointerImport
                    onMouseOver={() => this.props.onMouseOver(this.getLocation())}
                    onMouseOut={this.props.onMouseOut}
                >
                <span ref={this.innerRef}>
                $1
                </span>
                </ClosedPointerImport>
            );
        } else {
            return (
                <OpenPointerImport
                    onMouseOver={() => this.props.onMouseOver(this.getLocation())}
                    onMouseOut={this.props.onMouseOut}
                >
                    This is a very funny sentence that will go right here...
                </OpenPointerImport>
            );
        }
    }
}

export const PointerImportMark: any = compose(
    connect(
        ({ blockEditor}) => ({ blockEditor }), {changeHoverItem }
    )
)(PointerImportMarkPresentational);