import * as React from "react";
import Plain from "slate-plain-serializer";
import { Editor } from "slate-react";
import _ = require("lodash");
import { Field } from "react-final-form";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import * as uuidv1 from "uuid/v1";
import ReactDOM = require("react-dom");
import { Menu } from "./Menu";
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";

export class BlockEditor extends React.Component<any, any> {
    public menu;

    public constructor(props: any) {
        super(props);
        this.menuRef = this.menuRef.bind(this);
        this.onPointerHover = this.onPointerHover.bind(this);
        this.renderMark = this.renderMark.bind(this);
    }

    public componentDidMount() {
        this.updateMenu();
      }

      public componentDidUpdate() {
        this.updateMenu();
      }

    public onPointerHover(location) {
        console.log("staring menu");
        const menu = this.menu;
        if (!menu) { return; }
        menu.style.opacity = 1;
        menu.style.top = location.top;
        menu.style.left = location.left;
        console.log(menu.style);
    }

    public updateMenu() {
        console.log("Updating menu");
        const { value } = this.props;
        const menu = this.menu;
        if (!menu) { return; }

        if (value.isBlurred || value.isEmpty) {
          menu.removeAttribute("style");
          return;
        }

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        menu.style.opacity = 1;
        menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`;
        menu.style.left = `${rect.left +
          window.pageXOffset -
          menu.offsetWidth / 2 +
          rect.width / 2}px`;
        console.log("menu style", menu.style.opacity, menu.style.left, menu.style.top);
      }

    public updateValue(event: any, value: any) {
        event.preventDefault();
        const uuid = uuidv1();
        const change = value.change().toggleMark({ type: "pointerExport", object: "mark", data: { pointerId: uuid } });
        return change.value;
    }

    public renderMark(props) {
        const { children, mark } = props;
        switch (mark.type) {
            case "pointerExport":
                return <PointerExportMark mark={mark.toJSON()}>{children}</PointerExportMark>;
            case "pointerImport":
                return <PointerImportMark mark={mark.toJSON()} onHover={this.onPointerHover}>{children}</PointerImportMark>;
            default:
                return { children };
        }
    }

    public menuRef(menu: any) {
        this.menu = menu;
    }
    public render() {
        const { value, onChange, readOnly } = this.props;
        if (readOnly) {
            return (
                <Editor
                    value={this.props.value || Plain.deserialize("")}
                    renderMark={this.renderMark}
                    readOnly={true}
                />
            );
        } else {
            return (
                <div>
                        <Menu
                            menuRef={this.menuRef}
                            value={value}
                            onChange={onChange}
                        />
                        <Button
                            onClick={(e) => onChange(this.updateValue(e, value))}
                        >
                            CHANGE
                            </Button>
                        <Button
                            onClick={(event) => {
                                const ch = value.change()
                                    .insertText("hi there!")
                                    .extend(0 - "hi there!".length)
                                    .addMark({ type: "pointerImport", object: "mark", data: { pointerId: "sd8fjsdf8js" } });
                                onChange(ch.value);
                            }}
                        >
                            Add
                            </Button>
                        <Editor
                            value={value}
                            onChange={(c) => { onChange(c.value); }}
                            renderMark={this.renderMark}
                        />

                </div>
            );
        }
    }
}