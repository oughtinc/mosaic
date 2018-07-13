import * as React from "react";
import { Menu } from "./Menu";
import { compose } from "recompose";
import { connect } from "react-redux";
import { removeHoverItem } from "../../modules/blockEditor/actions";

class BlockHoverMenuPresentational extends React.Component<any, any> {
  public menu;

  public constructor(props: any) {
    super(props);
  }

  public componentDidMount() {
    this.updateMenu();
  }

  public componentWillUnmount() {
    this.props.removeHoverItem();
  }

  public componentDidUpdate() {
    this.updateMenu();
  }

  public updateMenu = () => {
    const { hoveredItem } = this.props.blockEditor;
    const menu = this.menu;

    if (!menu) {
      return;
    }

    if (hoveredItem.hoverItemType === "NONE") {
      menu.style.opacity = 0;
      return;
    }

    menu.style.opacity = 1;
    const scrollY: number = window.scrollY;
    menu.style.top = `${parseInt(hoveredItem.top, 10) + scrollY - 29}px`;
    menu.style.left = `${hoveredItem.left}px`;
  };

  public menuRef = (menu: any) => {
    this.menu = menu;
  };

  public render() {
    return (
      <div>
        <Menu menuRef={this.menuRef} blockEditor={this.props.blockEditor} />
        {this.props.children}
      </div>
    );
  }
}

export const BlockHoverMenu: any = compose(
  connect(
    ({ blockEditor }) => ({ blockEditor }),
    { removeHoverItem }
  )
)(BlockHoverMenuPresentational);
