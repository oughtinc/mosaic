import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { connect } from "react-redux";
import { changePointerReference, exportSelection, removeExportOfSelection, removeImportOfSelection, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import * as _ from "lodash";

const HoverMenu = styled.span`
  background-color: #b5b5b557;
  color: black;
  padding: 2px 3px;
  border-radius: 3px;
  border: 1px solid #d5d5d5;
`;

export class ImportMenu extends React.Component<any, any> {
  public render() {
    const {blockEditor: {hoveredItem: {id}, pointerReferences}, onChangePointerReference} = this.props;
    const reference = pointerReferences[id];
    const isOpen = reference && reference.isOpen;
    return (
      <div>
        {isOpen &&
          <Button bsSize={"xsmall"} onClick={() => onChangePointerReference({id, reference: {isOpen: false}})} >
            Close 
          </Button>
        }
        {!isOpen &&
          <Button bsSize={"xsmall"} onClick={() => onChangePointerReference({id, reference: {isOpen: true}})} >
            Expand
          </Button>
        }
          <Button bsSize={"xsmall"} onClick={() => {this.props.removeImportOfSelection(); }}>
            Remove 
          </Button>
      </div>
    );
  }
}

export class ExportMenu extends React.Component<any, any> {
  public render() {
    return (
      <div>
        <Button bsSize={"xsmall"} onClick={() => {this.props.removeExportOfSelection(); }} >
            Remove Pointer 
        </Button>
      </div>
    );
  }
}

export class MenuPresentational extends React.Component<any> {
  public constructor(props: any) {
    super(props);
  }

  public render() {
    const root: any = window.document.getElementById("root");
    const {blockEditor} = this.props;
    const hoverItemType = _.get(blockEditor, "hoveredItem.hoverItemType");
    return ReactDOM.createPortal(
      <div className="menu hover-menu" ref={this.props.menuRef}>
      {blockEditor &&
        <HoverMenu>
          {(hoverItemType === HOVER_ITEM_TYPES.SELECTED_TEXT) &&
              <Button bsSize={"xsmall"} onClick={() => {this.props.exportSelection(); }} >
                  Export 
              </Button>
          }
          {(hoverItemType === HOVER_ITEM_TYPES.POINTER_IMPORT) &&
            <ImportMenu
              blockEditor={this.props.blockEditor}
              removeImportOfSelection={this.props.removeImportOfSelection}
              onChangePointerReference={this.props.changePointerReference}
            />
          }
          {(hoverItemType === HOVER_ITEM_TYPES.POINTER_EXPORT) &&
            <ExportMenu
              blockEditor={this.props.blockEditor}
              removeExportOfSelection={this.props.removeExportOfSelection}
            />
          }
        </HoverMenu>
      }
      </div>,
      root
    );
  }
}

export const Menu: any = compose(
    connect(
        ({ blockEditor }) => ({ blockEditor }), { changePointerReference, exportSelection, removeExportOfSelection, removeImportOfSelection }
    )
)(MenuPresentational);
