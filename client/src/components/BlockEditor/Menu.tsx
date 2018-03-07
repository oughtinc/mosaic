import React = require("react");
import ReactDOM = require("react-dom");
import styled from "styled-components";
import { Button } from "react-bootstrap";

const HoverMenu = styled.span`
  background-color: #def4f757;
  color: black;
  padding: 3px 8px;
  border-radius: 2px;
  border: 1px solid #88d3eb;
`;

export class ImportMenu extends React.Component<any, any> {
  public render() {
    const {blockEditor: {hoveredItem: {id}, pointerReferences}, onChangePointerReference} = this.props;
    const reference = pointerReferences[id];
    const isOpen = reference && reference.isOpen;
    return (
      <div>
        {isOpen &&
          <Button bsSize={"small"} onClick={() => onChangePointerReference({id, reference: {isOpen: false}})} >
            Close 
          </Button>
        }
        {!isOpen &&
          <Button bsSize={"small"} onClick={() => onChangePointerReference({id, reference: {isOpen: true}})} >
            Expand
          </Button>
        }
          <Button bsSize={"small"}>
            Remove 
          </Button>
      </div>
    );
  }
}

export class Menu extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }
  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  public hasMark(type) {
    const { value } = this.props;
    return value.activeMarks.some((mark) => mark.type === type);
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {String} type
   */

  public onClickMark(event, type) {
    const { value, onChange } = this.props;
    event.preventDefault();
    const change = value.change().toggleMark(type);
    onChange(change);
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  public renderMarkButton(type, icon) {
    const isActive = this.hasMark(type);
    const onMouseDown = (event) => this.onClickMark(event, type);

    return (
      // eslint-disable-next-line react/jsx-no-bind
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        MARK BUTTON
        </span>
    );
  }

  /**
   * Render.
   *
   * @return {Element}
   */

  public render() {
    const root: any = window.document.getElementById("root");
    const {blockEditor} = this.props;
    return ReactDOM.createPortal(
      <div className="menu hover-menu" ref={this.props.menuRef}>
        <HoverMenu>
          {blockEditor && (blockEditor.hoveredItem.hoverItemType === "INPUT") &&
            <ImportMenu
              blockEditor={this.props.blockEditor}
              onChangePointerReference={this.props.onChangePointerReference}
            />
          }
        </HoverMenu>
      </div>,
      root
    );
  }
}