import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";

import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { connect } from "react-redux";
import {
  changePointerReference,
  exportSelection,
  removeExportOfSelection,
  HOVER_ITEM_TYPES
} from "../../modules/blockEditor/actions";
import { Auth } from "../../auth";

const HoverMenu = styled.span`
  background-color: #b5b5b557;
  color: black;
  padding: 2px 3px;
  border-radius: 3px;
  border: 1px solid #d5d5d5;
`;

const ImportedPointerMenu = props => {
  const {
    blockEditor: {
      hoveredItem: { id },
      pointerReferences
    },
    onChangePointerReference
  } = props;
  const reference = pointerReferences[id];
  const isOpen = reference && reference.isOpen;
  return (
    <HoverMenu>
      <Button
        bsSize={"xsmall"}
        onClick={() =>
          onChangePointerReference({ id, reference: { isOpen: !isOpen } })
        }
      >
        {isOpen ? "Close" : "Expand"}
      </Button>
    </HoverMenu>
  );
};

const ExportedPointerMenu = ({ removeExportOfSelection }) => {
  return (
    <HoverMenu>
      <Button
        bsSize={"xsmall"}
        onClick={() => {
          removeExportOfSelection();
        }}
      >
        Remove Pointer
      </Button>
    </HoverMenu>
  );
};

const ExportSelectionMenu = ({ exportSelection }) => (
  <HoverMenu>
    <Button
      bsSize={"xsmall"}
      onClick={() => {
        exportSelection();
      }}
    >
      Export
    </Button>
  </HoverMenu>
);

export class MenuPresentational extends React.Component<any> {
  public constructor(props: any) {
    super(props);
  }

  public render() {
    const root: any = window.document.getElementById("root");
    const { blockEditor } = this.props;
    const hoverItemType = _.get(blockEditor, "hoveredItem.hoverItemType");
    return ReactDOM.createPortal(
      <div className="menu hover-menu" ref={this.props.menuRef} id="hover-menu">
        {blockEditor && (
          <div>
            {hoverItemType === HOVER_ITEM_TYPES.SELECTED_TEXT && (
              <ExportSelectionMenu
                exportSelection={this.props.exportSelection}
              />
            )}
            {hoverItemType === HOVER_ITEM_TYPES.POINTER_IMPORT && (
              <ImportedPointerMenu
                blockEditor={this.props.blockEditor}
                onChangePointerReference={this.props.changePointerReference}
              />
            )}
            {hoverItemType === HOVER_ITEM_TYPES.POINTER_EXPORT &&
              Auth.isAuthorizedToEditBlock(
                _.get(blockEditor, "hoveredItem.blockId")
              ) && (
                <ExportedPointerMenu
                  removeExportOfSelection={this.props.removeExportOfSelection}
                />
              )}
          </div>
        )}
      </div>,
      root
    );
  }
}

export const Menu: any = compose(
  connect(
    ({ blockEditor }) => ({ blockEditor }),
    { changePointerReference, exportSelection, removeExportOfSelection }
  )
)(MenuPresentational);
