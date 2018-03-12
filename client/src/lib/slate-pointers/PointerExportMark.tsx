import styled from "styled-components";
import React = require("react");
import ReactDOM = require("react-dom");
import { compose } from "recompose";
import { connect } from "react-redux";
import { changeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";

const PointerExportStyle: any = styled.span`
    background: ${(props: any) => props.isSelected ? "rgba(85, 228, 38, 0.9)" : "rgba(162, 238, 156, 0.5)"};
    transition: background .2s;
    color: #000000;
`;

export class PointerExportMark extends React.Component<any, any> {
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
        console.log("Mouse over");
        const { top, left } = this.getLocation();
        // this.props.changeHoverItem({
        //     hoverItemType: HOVER_ITEM_TYPES.POINTER_EXPORT, 
        //     id: this.props.mark.data.pointerId,
        //     top,
        //     left, 
        //     blockId: this.props.blockId,
        // });
    }

    public render() {
        console.log("UPDATING");
        const isSelected = false; // this.props.hoveredItem.id === this.props.mark.data.pointerId;
        return (
            <PointerExportStyle
                isSelected={isSelected}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.props.children}
            </PointerExportStyle>
        );
    }
}