import styled from "styled-components";
import React = require("react");
import ReactDOM = require("react-dom");

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
        const { top, left } = this.getLocation();
        this.props.onMouseOver({top, left});
    }

    public render() {
        const isSelected = this.props.blockEditor.hoveredItem.id === this.props.nodeAsJson.data.pointerId;
        const children: any = this.props.children;
        return (
            <PointerExportStyle
                isSelected={isSelected}
                onMouseOut={this.props.onMouseOut}
            >
            {children.map((child, index) => {
                const isNestedPointer = (child.props.node.object === "inline");
                
                if (!isNestedPointer) {
                    return (
                        <span
                          key={index}
                          onMouseOver={this.onMouseOver}
                        >
                            {child}
                        </span>
                    );
                } else {
                    return ( child );
                }
            })}
            </PointerExportStyle>
        );
    }
}
