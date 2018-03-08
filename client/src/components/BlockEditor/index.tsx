import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as uuidv1 from "uuid/v1";
import Plain from "slate-plain-serializer";
import styled from "styled-components";
import { Button, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
import { Editor } from "slate-react";
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";
import { addBlocks, updateBlock } from "../../modules/blocks/actions";
import { changePointerReference, changeHoverItem } from "../../modules/blockEditor/actions";
import { compose } from "recompose";
import { connect } from "react-redux";
import { exportingLeavesSelector } from "../../modules/blocks/ExportSelector";

const BlockReadOnlyStyle = styled.div`
    border: 1px solid #eee;
    border-radius: 2px;
    padding: .3em;
`;

const BlockEditorStyle = styled.div`
    background: #f4f4f4;
    border-radius: 2px;
    border: 1px solid #d5d5d5;
    margin-bottom: 1em;
    padding: .3em;
`;

class BlockEditorPresentational extends React.Component<any, any> {
  public menu;
  public constructor(props: any) {
    super(props);
    this.renderMark = this.renderMark.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  public componentDidMount() {
    const {name, blockId, initialValue} = this.props;
    const blockForm = {
      id: blockId,
      name,
      value: initialValue,
    };
    this.props.addBlocks([blockForm]);
  }

  public onSelect(event: any) {
    const block = this.props.block;
    const value = block.value;
    if (value.isBlurred || value.isEmpty) {
      return;
    }

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0) {
      window.setTimeout(
        () => {
          this.props.changeHoverItem({ hoverItemType: "NONE", id: false, top: false, left: false, blockId: false });
        }, 10);
      return;
    }

    const _top = `${(rect.top - 44).toFixed(2)}px`;
    const _left = `${(rect.left.toFixed(2))}px`;
    const { hoveredItem: { id, top, left } } = this.props.blockEditor;
    if ((_top !== top) || (_left !== left)) {
      window.setTimeout(
        () => {
          this.props.changeHoverItem({ hoverItemType: "SELECTED_TEXT", id: "NOT_NEEDED", top: _top, left: _left, blockId: this.props.blockId });
        }, 10
      );
    }
  }

  public renderMark(props) {
    const { children, mark, blockId } = props;
    switch (mark.type) {
      case "pointerExport":
        return (
          <PointerExportMark
            mark={mark.toJSON()}
            blockId={this.props.blockId}
          >
            {children}
          </PointerExportMark>
        );
      case "pointerImport":
        const { internalReferenceId } = mark.toJSON().data;
        const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
        return (
          <PointerImportMark
            mark={mark.toJSON()}
            blockId={this.props.blockId}
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
    const block = this.props.block;
    if (!block) {
      return (<div> loading... </div>);
    }
    const value = block.value;
    const onChange = (value) => { this.props.updateBlock({ id: block.id, value }); };
    console.log("Here", this.props);
    const exportingLeaves = this.props.exportingLeaves;
    if (readOnly) {
      return (
          <BlockReadOnlyStyle>
        <Editor
          value={value}
          renderMark={this.renderMark}
          readOnly={true}
        />
          </BlockReadOnlyStyle>
      );
    } else {
      return (
        <div>
          <BlockEditorStyle>
          <DropdownButton title="Import" id="bg-nested-dropdown" bsSize={"xsmall"} style={{marginBottom: "5px"}}>
            {exportingLeaves.map((e: any) => (
              <MenuItem
                eventKey="1"
                onClick={(event) => {
                  const ch = value.change()
                    .insertText("~~")
                    .extend(0 - "~~".length)
                    .addMark({ type: "pointerImport", object: "mark", data: { pointerId: e.pointerId, internalReferenceId: uuidv1() } });
                  onChange(ch.value);
                }}
              >
                {e.pointerId}
              </MenuItem>
            ))}
          </DropdownButton>
            <Editor
              value={value}
              onChange={(c) => { onChange(c.value); }}
              renderMark={this.renderMark}
              onSelect={this.onSelect}
            />
          </BlockEditorStyle>

        </div>
      );
    }
  }
}

function mapStateToProps(state: any, {blockId}: any) {
  const exportingLeaves = exportingLeavesSelector(state);
  const {blocks, blockEditor} = state;
  const block = blocks.blocks.find((b) => b.id === blockId);
  return {block, blockEditor, exportingLeaves};
}

export const BlockEditor: any = compose(
  connect(
    mapStateToProps, { addBlocks, updateBlock, changeHoverItem }
  )
)(BlockEditorPresentational);
