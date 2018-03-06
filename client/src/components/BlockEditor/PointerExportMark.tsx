import styled from "styled-components";
import React = require("react");

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

export class PointerExportMark extends React.Component<any, any> {
    public render() {
        return (
            <span>
                <span style={{ backgroundColor: "#f88" }}>
                    {this.props.children}
                </span>
                <SideThing>{this.props.mark.data.pointerId} </SideThing>
            </span>
        );
    }
}
