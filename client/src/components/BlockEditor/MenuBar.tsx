import * as React from "react";
import styled from "styled-components";
import { DropdownButton, MenuItem } from "react-bootstrap";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faSpinner = require("@fortawesome/fontawesome-free-solid/faSpinner");
import faCheck = require("@fortawesome/fontawesome-free-solid/faCheck");
import faExclamationTriangle = require("@fortawesome/fontawesome-free-solid/faExclamationTriangle");
import { MutationStatus } from "./types";
import { ShowExpandedPointer } from "../../lib/slate-pointers/ShowExpandedPointer";

const SavingIconStyle = styled.span`
    float: right;
    margin-right: 3px;
    font-size: .8em;
    margin-top: 1px;
`;

export class PointerDropdownMenu extends React.Component<any, any> {
    public render() {
        return (
                <DropdownButton title="Import" id="bg-nested-dropdown" bsSize={"xsmall"} style={{ marginBottom: "5px", marginRight: "5px" }}>
                    {this.props.availablePointers.map((e: any, index: number) => (
                        <MenuItem
                            eventKey="1"
                            key={index}
                            onClick={(event) => {
                                this.props.onAddPointerImport(e.data.pointerId);
                            }}
                        >
                            <span>
                                {`$${index + 1} - ${e.data.pointerId.slice(0, 5)}`}
                                <ShowExpandedPointer
                                    exportingPointer={e}
                                    exportingPointers={this.props.availablePointers}
                                    blockEditor={this.props.blockEditor}
                                    isHoverable={false}
                                />
                            </span>
                        </MenuItem>
                    ))}
                </DropdownButton>
        );
    }
}

const Icons = {
    [MutationStatus.NOT_STARTED]: null,
    [MutationStatus.LOADING]: <FontAwesomeIcon icon={faSpinner} spin={true} style={{color: "rgb(150,150,150)"}} />,
    [MutationStatus.COMPLETE]: <FontAwesomeIcon icon={faCheck} style={{ color: "rgb(167, 204, 167)" }} />,
    [MutationStatus.ERROR]: <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: "#ef0707" }} />,
};

export class SavingIcon extends React.Component<any, any> {
    public render() {
        const Icon = Icons[this.props.mutationStatus.status];
        const {hasChangedSinceDatabaseSave} = this.props;
        const inErrorState = this.props.mutationStatus === MutationStatus.ERROR;
        if (!hasChangedSinceDatabaseSave || inErrorState) {
            return (
                <SavingIconStyle>
                    {Icon}
                </SavingIconStyle>
            );
        } else {
            return (false);
        }
    }
}

export class MenuBar extends React.Component<any, any> {
    public render() {
        return (
            <div>
                <PointerDropdownMenu
                    onAddPointerImport={this.props.onAddPointerImport}
                    availablePointers={this.props.availablePointers}
                />
                <SavingIcon
                    hasChangedSinceDatabaseSave={this.props.hasChangedSinceDatabaseSave}
                    mutationStatus={this.props.mutationStatus}
                />
            </div>
        );
    }
}