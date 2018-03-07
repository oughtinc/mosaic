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
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";
import { compose } from "recompose";
import { addBlocks, updateBlock } from "../../modules/blocks/actions";
import { connect } from "react-redux";
import { changeHoverItem, changePointerReference } from "../../modules/blockEditor/actions";

class BlockEditorPresentational extends React.Component<any, any> {
    public menu;

    public constructor(props: any) {
        super(props);
        this.menuRef = this.menuRef.bind(this);
        this.renderMark = this.renderMark.bind(this);
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
                const { internalReferenceId } = mark.toJSON().data;
                const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
                const isOpen = reference && reference.isOpen;
                return (
                    <PointerImportMark
                        mark={mark.toJSON()}
                        onMouseOver={({ top, left }) => this.props.changeHoverItem({ hoverItemType: "INPUT", id: internalReferenceId, top, left })}
                        onMouseOut={() => { }}
                        isOpen={!!isOpen}
                    >
                        {children}
                    </PointerImportMark>
                );
            default:
                return { children };
        }
    }

    public menuRef(menu: any) {
        this.menu = menu;
    }
    public render() {
        const { readOnly } = this.props;
        const block = this.props.blocks.blocks.find((b) => b.id === this.props.blockId);
        const value = block.value;
        const onChange = (value) => { this.props.updateBlock({ id: block.id, value }); };
        const exportingLeaves = _.flatten(this.props.blocks.blocks.map((b) => b.exportingLeaves));
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
                        blockEditor={this.props.blockEditor}
                        onChangePointerReference={this.props.changePointerReference}
                    />
                    <Button
                        onClick={(e) => onChange(this.updateValue(e, value))}
                    >
                       Export Selection 
                            </Button>
                    <DropdownButton title="Import" id="bg-nested-dropdown">
                        {exportingLeaves.map((e: any) => (
                            <MenuItem
                                eventKey="1"
                                onClick={(event) => {
                                    const ch = value.change()
                                        .insertText("~")
                                        .extend(0 - "~".length)
                                        .addMark({ type: "pointerImport", object: "mark", data: { pointerId: e.pointerId, internalReferenceId: uuidv1() } });
                                    onChange(ch.value);
                                }}
                            >
                                {e.pointerId}</MenuItem>
                        ))}
                    </DropdownButton>
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

export const BlockEditor: any = compose(
    connect(
        ({ blocks, blockEditor }) => ({ blocks, blockEditor }), { updateBlock, changeHoverItem, changePointerReference }
    )
)(BlockEditorPresentational);