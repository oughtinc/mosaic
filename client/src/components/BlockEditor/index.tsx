import * as React from "react";
import * as uuidv1 from "uuid/v1";
import Plain from "slate-plain-serializer";
import { Inline } from "slate";
import styled from "styled-components";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { Editor } from "slate-react";
import { addBlocks, updateBlock, removeBlocks } from "../../modules/blocks/actions";
import { changeHoverItem, removeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import { compose, withProps } from "recompose";
import { connect } from "react-redux";
import SoftBreak from "slate-soft-break";
import { exportingPointersSelector, importingPointersSelector } from "../../modules/blocks/exportingPointers";
import { SlatePointers } from "../../lib/slate-pointers";
import { ShowExpandedPointer } from "../../lib/slate-pointers/ShowExpandedPointer";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import _ = require("lodash");

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
    this.onChange = this.onChange.bind(this);
    this.state = {
      plugins: [],
    };
  }

  public componentWillMount() {
    this.resetPlugins(this.props);
  }

  public componentWillReceiveProps(newProps: any) {
    if (
      (JSON.stringify(newProps.blockEditor) !== JSON.stringify(this.props.blockEditor))
      || (newProps.availablePointers.length !== this.props.availablePointers.length)
    ) {
      this.resetPlugins(newProps);
    }
  }

  public resetPlugins(newProps: any) {
    const SlatePointerInputs = {
      onSelectNull: () => {
        newProps.removeHoverItem();
      },
      onSelect: ({ top, left }) => {
        newProps.changeHoverItem({
          hoverItemType: HOVER_ITEM_TYPES.SELECTED_TEXT,
          id: false,
          top,
          left,
          blockId: newProps.blockId,
        });
      },
      onMouseOverPointerExport: ({ top, left, id }) => {
        newProps.changeHoverItem({
          hoverItemType: HOVER_ITEM_TYPES.POINTER_EXPORT,
          id,
          top,
          left,
          blockId: newProps.blockId,
        });
      },
      onMouseOverPointerImport: ({ top, left, id }) => {
        newProps.changeHoverItem({
          hoverItemType: HOVER_ITEM_TYPES.POINTER_IMPORT,
          id,
          top,
          left,
          blockId: false,
        });
      },
      blockEditor: newProps.blockEditor,
      exportingPointers: newProps.availablePointers,
      canExport: true, // newProps.canExport || false,
    };
    this.setState({
      plugins: [
        SoftBreak({}),
        SlatePointers(SlatePointerInputs),
      ],
    });
  }

  public componentDidMount() {
    const { name, blockId, initialValue } = this.props;
    const value = initialValue || Plain.deserialize("");

    const blockForm = {
      id: blockId,
      name,
      value,
    };

    this.props.addBlocks([blockForm]);
    this.resetPlugins(this.props);
  }

  public componentWillUnmount() {
    const { blockId } = this.props;
    this.props.removeBlocks([blockId]);
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
    const availablePointers = this.props.availablePointers;
    const {plugins} = this.state;
    if (readOnly) {
      return (
        <BlockReadOnlyStyle>
          <Editor
            value={value}
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
              {availablePointers.map((e: any, index: number) => (
                <MenuItem
                  eventKey="1"
                  key={index}
                  onClick={(event) => {
                    const ch = value.change()
                      .insertInline(Inline.fromJSON({
                        object: "inline",
                        type: "pointerImport",
                        isVoid: true,
                        data: {
                          pointerId: e.data.pointerId,
                          internalReferenceId: uuidv1(),
                        },
                      }));
                    this.onChange(ch.value);
                  }}
                >
                  <span>
                    {`$${index + 1} - ${e.data.pointerId.slice(0, 5)}`}
                      <ShowExpandedPointer
                        exportingPointer={e}
                        exportingPointers={this.props.availablePointers}
                        blockEditor={this.props.blockEditor}
                        isHoverable={false}
                      />
                  </span>
                </MenuItem>
              ))}
            </DropdownButton>
            <Editor
              value={value}
              onChange={(c) => { this.onChange(c.value); }}
              plugins={plugins}
            />
          </BlockEditorStyle>
        </div>
      );
    }
  }
}

function mapStateToProps(state: any, { blockId }: any) {
  const { blocks, blockEditor } = state;
  const block = blocks.blocks.find((b) => b.id === blockId);
  return { block, blockEditor };
}

export const BlockEditor: any = compose(
  connect(
    mapStateToProps, { addBlocks, updateBlock, removeBlocks, changeHoverItem, removeHoverItem }
  ),
  withApollo,
)(BlockEditorPresentational);
