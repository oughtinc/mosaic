import React = require("react");
import ReactDOM = require("react-dom");
import styled from "styled-components";

const HoverMenu = styled.span`
  display: inline-block;
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  transition: opacity 0.75s;
`;

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
  
      return ReactDOM.createPortal(
        <div className="menu hover-menu" ref={this.props.menuRef}>
          {this.renderMarkButton("bold", "format_bold")}
        </div>,
        root
      );
    }
}