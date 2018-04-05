import styled from "styled-components";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Menu } from "../../components/BlockHoverMenu/Menu";
import { HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";

const PointerExportStyle: any = styled.span`
    background: ${(props: any) => props.isSelected ? "rgba(85, 228, 38, 0.9)" : "rgba(162, 238, 156, 0.5)"};
    transition: background .2s;
    color: #000000;
`;

export class PointerExportMark extends React.Component<any, any> {
    public menu;
    public constructor(props: any) {
        super(props);
    }

    public componentWillUnmount() {
      // this.props.removeHoverItem();
    }

    public onMouseOver = () => {
      this.updateMenu();
        // const {left, top, right, bottom} = this.getLocation();
        // this.props.onMouseOver({left, top, right, bottom});
    }

    public onMouseLeave = () => {
      // const menu = this.menu;
      // menu.style.opacity = 0;
    }

    public updateMenu = () => {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      const { left, top, right, bottom } = rect;
      const menu = this.menu;

      if (!menu) {
        return;
      }

      menu.style.opacity = 1;
      const scrollY: number = window.scrollY;
      menu.style.top = `${top + scrollY - 29}px`;
      menu.style.left = `${left}px`;
    }

    public menuRef = (menu: any) => {
      this.menu = menu;
    }

    public render() {
        const isSelected = this.props.blockEditor.hoveredItem.id === this.props.nodeAsJson.data.pointerId;
        const children: any = this.props.children;
        return (
          <div onMouseLeave={this.onMouseLeave}>
              <PointerExportStyle
                  isSelected={isSelected}
              >
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
              </PointerExportStyle>
              <Menu
                menuType={HOVER_ITEM_TYPES.POINTER_EXPORT}
                menuRef={this.menuRef}
                blockEditor={this.props.blockEditor}
                nodeInfo={this.props.nodeInfo}
              />
            </div>
        );
    }
}
