import styled from "styled-components";
import React = require("react");
import ReactDOM = require("react-dom");
import { compose } from "recompose";
import { connect } from "react-redux";
import { changeHoverItem } from "../../modules/blockEditor/actions";

const PointerExportStyle = styled.span`
    background-color: #c9f2c9;
    color: #000000;
    border-radius: 2px;
`;

export class PointerExportMarkPresentational extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.getLocation = this.getLocation.bind(this);
    }

    public getLocation() {
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        return { top: `${rect.top - 40}px`, left: `${rect.left + 10}px` };
    }

    public onMouseOver() {
        const { top, left } = this.getLocation();
        this.props.changeHoverItem({ hoverItemType: "EXPORT", id: this.props.mark.data.pointerId, top, left, blockId: this.props.blockId });
    }

    public render() {
        return (
            <PointerExportStyle
                onMouseOver={this.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.props.children}
            </PointerExportStyle>
        );
    }
}

export const PointerExportMark: any = compose(
    connect(
        ({ }) => ({ }), {changeHoverItem }
    )
)(PointerExportMarkPresentational);