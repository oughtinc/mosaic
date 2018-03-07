import * as React from "react";
import Plain from "slate-plain-serializer";
import { Editor } from "slate-react";
import _ = require("lodash");
import { Button, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
import * as uuidv1 from "uuid/v1";
import ReactDOM = require("react-dom");
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";
import { compose } from "recompose";
import { addBlocks, updateBlock } from "../../modules/blocks/actions";
import { connect } from "react-redux";
import { changePointerReference } from "../../modules/blockEditor/actions";

class BlockEditorPresentational extends React.Component<any, any> {
    public menu;
    public constructor(props: any) {
        super(props);
        this.renderMark = this.renderMark.bind(this);
    }

    public toggleExport(event: any, value: any) {
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
                return (
                    <PointerImportMark
                        mark={mark.toJSON()}
                    >
                        {children}
                    </PointerImportMark>
                );
            default:
                return { children };
        }
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
                    <Button
                        onClick={(e) => onChange(this.toggleExport(e, value))}
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
        ({ blocks, blockEditor }) => ({ blocks, blockEditor }), { updateBlock }
    )
)(BlockEditorPresentational);