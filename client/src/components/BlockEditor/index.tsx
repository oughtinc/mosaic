import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as uuidv1 from "uuid/v1";
import Plain from "slate-plain-serializer";
import { Inline } from "slate";
import styled from "styled-components";
import { Button, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
import { Editor, findRange, getEventRange } from "slate-react";
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";
import { addBlocks, updateBlock } from "../../modules/blocks/actions";
import { changePointerReference, changeHoverItem, removeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import { compose } from "recompose";
import { connect } from "react-redux";
import SoftBreak from "slate-soft-break";
import { exportingPointersSelector } from "../../modules/blocks/exportingPointers";

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
const plugins = [
    SoftBreak({}),
  ];

class BlockEditorPresentational extends React.Component<any, any> {
  public menu;
  public constructor(props: any) {
    super(props);
    this.renderMark = this.renderMark.bind(this);
    this.renderNode = this.renderNode.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  public componentDidMount() {
    const { name, blockId, initialValue } = this.props;
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
          this.props.removeHoverItem();
        }, 10);
      return;
    }

    const _top = `${(rect.top - 44).toFixed(2)}px`;
    const _left = `${(rect.left.toFixed(2))}px`;
    const { hoveredItem: { id, top, left } } = this.props.blockEditor;
    if ((_top !== top) || (_left !== left)) {
      window.setTimeout(
        () => {
          this.props.changeHoverItem({
            hoverItemType: HOVER_ITEM_TYPES.SELECTED_TEXT,
            id: false,
            top: _top,
            left: _left,
            blockId: this.props.blockId,
          });
        }, 10
      );
    }
  }

  public renderNode(props: any) {
    const { attributes, children, node, isSelected } = props;
    if (node.type === "pointerImport") {
      return (
        <PointerImportMark
          mark={node.toJSON()}
          blockId={this.props.blockId}
        />
      );
    } else {
      return;
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
      // This can be removed soon, once database is replaced
      case "pointerImport":
        return (
          <span>
            {children}
          </span>
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
    const exportingPointers = this.props.exportingPointers;
    if (readOnly) {
      return (
        <BlockReadOnlyStyle>
          <Editor
            value={value}
            renderMark={this.renderMark}
            readOnly={true}
            plugins={plugins}
          />
        </BlockReadOnlyStyle>
      );
    } else {
      return (
        <div>
          <BlockEditorStyle>
            <DropdownButton title="Import" id="bg-nested-dropdown" bsSize={"xsmall"} style={{ marginBottom: "5px" }}>
              {exportingPointers.map((e: any, index: any) => (
                <MenuItem
                  eventKey="1"
                  onClick={(event) => {
                    const ch = value.change()
                      .insertInline(Inline.fromJSON({
                        object: "inline",
                        type: "pointerImport",
                        isVoid: true,
                        data: {
                          pointerId: e.pointerId,
                          internalReferenceId: uuidv1(),
                        },
                      }));
                    onChange(ch.value);
                  }}
                >
                  {`$${index + 1} - ${e.pointerId.slice(0, 5)} - ${e.text && e.text.slice(0, 20)}`}
                </MenuItem>
              ))}
            </DropdownButton>
            <Editor
              value={value}
              onChange={(c) => { onChange(c.value); }}
              renderMark={this.renderMark}
              renderNode={this.renderNode}
              onSelect={this.onSelect}
              plugins={plugins}
            />
          </BlockEditorStyle>
        </div>
      );
    }
  }
}

function mapStateToProps(state: any, { blockId }: any) {
  const exportingPointers = exportingPointersSelector(state);
  const { blocks, blockEditor } = state;
  const block = blocks.blocks.find((b) => b.id === blockId);
  return { block, blockEditor, exportingPointers };
}

export const BlockEditor: any = compose(
  connect(
    mapStateToProps, { addBlocks, updateBlock, changeHoverItem, removeHoverItem }
  )
)(BlockEditorPresentational);
