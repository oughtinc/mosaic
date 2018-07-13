import * as React from "react";
import styled from "styled-components";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faSpinner = require("@fortawesome/fontawesome-free-solid/faSpinner");
import faCheck = require("@fortawesome/fontawesome-free-solid/faCheck");
import faExclamationTriangle = require("@fortawesome/fontawesome-free-solid/faExclamationTriangle");
import { MutationStatus } from "./types";
import { ShowExpandedPointer } from "../../lib/slate-pointers/ShowExpandedPointer";
import * as _ from "lodash";

const SavingIconStyle = styled.span`
  float: right;
  margin-right: 3px;
  font-size: 0.8em;
  margin-top: 1px;
`;

interface PointerDropdownMenuProps {
  availablePointers: any[];
  blockEditor: any;
  onAddPointerImport(pointerId: string): () => {};
}

export class PointerDropdownMenu extends React.Component<
  PointerDropdownMenuProps
> {
  public shouldComponentUpdate(newProps: any, newState: any) {
    if (!_.isEqual(newProps.availablePointers, this.props.availablePointers)) {
      return true;
    }
    return false;
  }

  public render() {
    return (
      <DropdownButton
        title="Import"
        id="bg-nested-dropdown"
        bsSize={"xsmall"}
        style={{ marginBottom: "5px", marginRight: "5px" }}
        tabIndex={-1}
      >
        {this.props.availablePointers.map((e: any, index: number) => (
          <MenuItem
            eventKey="1"
            key={index}
            onClick={event => {
              this.props.onAddPointerImport(e.data.pointerId);
            }}
          >
            <span>
              {`$${index + 1} - ${e.data.pointerId.slice(0, 5)}`}
              <ShowExpandedPointer
                exportingPointer={e}
                availablePointers={this.props.availablePointers}
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
  [MutationStatus.NotStarted]: null,
  [MutationStatus.Loading]: (
    <FontAwesomeIcon
      icon={faSpinner}
      spin={true}
      style={{ color: "rgb(150,150,150)" }}
    />
  ),
  [MutationStatus.Complete]: (
    <FontAwesomeIcon icon={faCheck} style={{ color: "rgb(167, 204, 167)" }} />
  ),
  [MutationStatus.Error]: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      style={{ color: "#ef0707" }}
    />
  )
};

const SavingIcon = ({
  mutationStatus,
  hasChangedSinceDatabaseSave,
  blockEditor
}) => {
  const Icon = Icons[mutationStatus.status];
  const inErrorState = mutationStatus === MutationStatus.Error;

  // if the user types more after we show the icon,
  // only continue to show it if there's an error
  // to avoid distracting them w/ unimportant information.
  if (!hasChangedSinceDatabaseSave || inErrorState) {
    return <SavingIconStyle>{Icon}</SavingIconStyle>;
  } else {
    return <span />;
  }
};

export const MenuBar = ({
  onAddPointerImport,
  availablePointers,
  mutationStatus,
  hasChangedSinceDatabaseSave,
  blockEditor
}) => (
  <div>
    <PointerDropdownMenu
      onAddPointerImport={onAddPointerImport}
      availablePointers={availablePointers}
      blockEditor={blockEditor}
    />
    <SavingIcon
      hasChangedSinceDatabaseSave={hasChangedSinceDatabaseSave}
      mutationStatus={mutationStatus}
      blockEditor={blockEditor}
    />
  </div>
);
