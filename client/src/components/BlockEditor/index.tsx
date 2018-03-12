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
import { PointerImport } from "../PointerImport";
import { SlatePointers } from "../../lib/slate-pointers";

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
  private plugins;
  public constructor(props: any) {
    super(props);
    this.renderMark = this.renderMark.bind(this);
    this.renderNode = this.renderNode.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public componentWillReceiveProps(newProps: any) {
    if (
      (JSON.stringify(newProps.blockEditor) !== JSON.stringify(this.props.blockEditor))
      || (newProps.exportingPointers.length !== this.props.exportingPointers.length )
    ) {
      !!newProps && this.resetPlugins(newProps);
    }
  }

  public resetPlugins(newProps: any) {
    const SlatePointerInputs = {
      onSelectNull: () => {
        newProps.removeHoverItem();
      },
      onSelect: ({top, left}) => {
          newProps.changeHoverItem({
            hoverItemType: HOVER_ITEM_TYPES.SELECTED_TEXT,
            id: false,
            top,
            left,
            blockId: newProps.blockId,
          });
      },
      blockEditor: newProps.blockEditor,
      exportingPointers: newProps.exportingPointers,
      changeHoverItem: newProps.changeHoverItem,
    };
    this.setState({plugins: [
      SoftBreak({}),
      SlatePointers(SlatePointerInputs),
    ]});
  }

  public componentDidMount() {
    const { name, blockId, initialValue } = this.props;
    const blockForm = {
      id: blockId,
      name,
      value: initialValue || Plain.deserialize(""),
    };
    this.props.addBlocks([blockForm]);
    this.resetPlugins(this.props);
  }

  public renderNode(props: any) {
    const { attributes, children, node, isSelected } = props;

    if (node.type === "pointerImport") {
      const {internalReferenceId, pointerId} = node.toJSON().data;
      const reference = this.props.blockEditor.pointerReferences[internalReferenceId];
      const isOpen = reference && reference.isOpen;
      const isSelected = this.props.blockEditor.hoveredItem.id === internalReferenceId;
      const importingPointer: any = this.props.exportingPointers.find((l: any) => l.pointerId === pointerId);
      const pointerIndex = _.findIndex(this.props.exportingPointers, (l: any) => l.pointerId === pointerId);
      return (
        <PointerImportMark
          mark={node.toJSON()}
          blockId={this.props.blockId}
          importingPointer={importingPointer}
          isOpen={isOpen}
          isSelected={isSelected}
          pointerIndex={pointerIndex}
          changeHoverItem={this.props.changeHoverItem}
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

  public onChange(value: any) {
    this.props.updateBlock({ id: this.props.block.id, value }); 
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public render() {
    const { readOnly } = this.props;
    const block = this.props.block;
    if (!block) {
      return (<div> loading... </div>);
    }
    const value = block.value;
    const exportingPointers = this.props.exportingPointers;
    if (readOnly) {
      return (
        <BlockReadOnlyStyle>
          <Editor
            value={value}
            readOnly={false}
            plugins={this.state.plugins}
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
                  key={e.pointerId}
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
                    this.onChange(ch.value);
                  }}
                >
                <span>
                  {`$${index + 1} - ${e.pointerId.slice(0, 5)}`}
                  <PointerImport exportingPointer={e}/>
                </span>
                </MenuItem>
              ))}
            </DropdownButton>
            <Editor
              value={value}
              onChange={(c) => { this.onChange(c.value); }}
              plugins={this.state.plugins}
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
