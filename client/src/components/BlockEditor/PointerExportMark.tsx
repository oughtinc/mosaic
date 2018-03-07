import styled from "styled-components";
import React = require("react");

export class PointerExportMark extends React.Component<any, any> {
    public render() {
        return (
            <span>
                <span style={{ backgroundColor: "#f88" }}>
                    {this.props.children}
                </span>
            </span>
        );
    }
}
