import styled from "styled-components";
import * as React from "react";
import * as ReactDOM from "react-dom";
import _ = require("lodash");

function getMaxNesting(node: any): number {
    if (!node.nodes) { return 0; }
    const possibilities = node.nodes.filter((c) => c.object === "inline");
    return _.max(possibilities.map((p) => (getMaxNesting(p) + 1))) || 0;
}

const PointerExportStyle: any = styled.span`
    background: ${(props: any) => props.isSelected ? "rgba(85, 228, 38, 0.9)" : "rgba(200, 243, 197, 0.5)"};
    margin-left: 3px;
    transition: background .2s;
    color: #000000;
`;

const darkGreen = "rgba(12, 162, 0, 0.41)";

const Bracket: any = styled.span`
    color: ${darkGreen};
    font-size: 1.2em;
    font-weight: 800;
    line-height: 1em;
`;

const Tag: any = styled.span`
    padding: 0 3px;
    background: ${darkGreen};
    color: #e9efe9;
    margin-right: 1px;
    border-radius: 2px 0 0 2px;
    margin-left: 0px;
`;

export class PointerExportMark extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
    }

    public getLocation = () => {
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        const {left, top, right, bottom} = rect;
        return {left, top, right, bottom};
    }

    public onMouseOver = () => {
        const {left, top, right, bottom} = this.getLocation();
        this.props.onMouseOver({left, top, right, bottom});
    }

    public render() {
        const isSelected = this.props.blockEditor.hoveredItem.id === this.props.nodeAsJson.data.pointerId;
        const nesting = getMaxNesting(this.props.nodeAsJson);
        const children: any = this.props.children;
        return (
            <PointerExportStyle
                isSelected={isSelected}
                onMouseOut={this.props.onMouseOut}
            >
            <Tag>$1</Tag>
            <Bracket isStart={true}>{"["}</Bracket>
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
            <Bracket isStart={true}>{"]"}</Bracket>
            </PointerExportStyle>
        );
    }
}
