import * as React from "react";
import Plain from "slate-plain-serializer";
import { Editor } from "slate-react";
import _ = require("lodash");
import { Field } from "react-final-form";
import styled from "styled-components";
import { Button, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
import * as uuidv1 from "uuid/v1";
import ReactDOM = require("react-dom");
import { Menu } from "./Menu";
import { compose } from "recompose";
import { connect } from "react-redux";
import { changeHoverItem, changePointerReference } from "../../modules/blockEditor/actions";

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

    public componentDidUpdate() {
        this.updateMenu();
    }

    public updateMenu() {
        const { hoveredItem } = this.props.blockEditor;
        const { value } = this.props;
        const menu = this.menu;

        if (!menu || !hoveredItem.id) {
            // menu.style.opacity = 0;
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
        ({ blockEditor }) => ({ blockEditor })
    )
)(BlockHoverMenuPresentational);