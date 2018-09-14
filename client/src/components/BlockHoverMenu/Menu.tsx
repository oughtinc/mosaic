import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";

import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { connect } from "react-redux";
import {
  removeExportOfSelection,
  HOVER_ITEM_TYPES
} from "../../modules/blockEditor/actions";

const HoverBackground = styled.span`
  background-color: #b5b5b557;
  color: black;
  padding: 2px 3px;
  border-radius: 3px;
  border: 1px solid #d5d5d5;
`;

const HoverButton = ({ children, onClick }) => (
  <HoverBackground>
    <Button bsSize={"xsmall"} onClick={onClick}>
      {children}
    </Button>
  </HoverBackground>
);

const ExportedPointerMenu = ({ removeExportOfSelection }) => (
  <HoverButton onClick={removeExportOfSelection}>Remove Pointer</HoverButton>
);

export class MenuPresentational extends React.Component<any> {
  public constructor(props: any) {
    super(props);
  }

  public render() {
    const root: any = window.document.getElementById("root");
    const { blockEditor } = this.props;
    const hoverItemType = _.get(blockEditor, "hoveredItem.hoverItemType");
    const readOnly = _.get(blockEditor, "hoveredItem.readOnly");

    return ReactDOM.createPortal(
      <div className="menu hover-menu" ref={this.props.menuRef} id="hover-menu">
        {blockEditor && (
          <div>
            {hoverItemType === HOVER_ITEM_TYPES.POINTER_EXPORT &&
              !readOnly && (
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
    { removeExportOfSelection }
  )
)(MenuPresentational);
