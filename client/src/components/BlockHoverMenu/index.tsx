import * as React from "react";
import { Menu } from "./Menu";
import { compose } from "recompose";
import { connect } from "react-redux";
import { removeHoverItem } from "../../modules/blockEditor/actions";

class BlockHoverMenuPresentational extends React.Component<any, any> {
    public menu;

    public constructor(props: any) {
        super(props);
        this.menuRef = this.menuRef.bind(this);
        this.updateMenu = this.updateMenu.bind(this);
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

    public updateMenu() {
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
        menu.style.top = hoveredItem.top;
        menu.style.left = hoveredItem.left;
    }

    public menuRef(menu: any) {
        this.menu = menu;
    }

    public render() {
            return (
                <div>
                    <Menu
                        menuRef={this.menuRef}
                        blockEditor={this.props.blockEditor}
                    />
                    {this.props.children}
                </div>
            );
        }
}

export const BlockHoverMenu: any = compose(
    connect(
        ({ blockEditor }) => ({ blockEditor }),
        {removeHoverItem}
    )
)(BlockHoverMenuPresentational);
