import * as React from "react";
import Plain from "slate-plain-serializer";
import styled from "styled-components";
import { Editor } from "slate-react";
import { addBlocks } from "../../modules/blocks/actions";
import { changeHoverItem, removeHoverItem, HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";
import { compose } from "recompose";
import { connect } from "react-redux";
import SoftBreak from "slate-soft-break";
import { SlatePointers } from "../../lib/slate-pointers";
import { BlockEditorEditing } from "./BlockEditorEditing";

const BlockReadOnlyStyle = styled.div`
    border: 1px solid #eee;
    border-radius: 2px;
    padding: .3em;
`;

class BlockEditorPresentational extends React.Component<any, any> {
  public menu;
  public constructor(props: any) {
    super(props);
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
      canExport: newProps.canExport || false,
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
    const blockForm = {
      id: blockId,
      name,
      value: initialValue || Plain.deserialize(""),
    };
    this.props.addBlocks([blockForm]);
    this.resetPlugins(this.props);
  }
  public render() {
    const { readOnly } = this.props;
    const block = this.props.block;
    if (!block) {
      return (<div> loading... </div>);
    }
    const value = block.value;
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
        <BlockEditorEditing
            value={value}
            readOnly={true}
            shouldAutosave ={!!this.props.shouldAutosave}
            block={this.props.block}
            availablePointers={this.props.availablePointers}
            plugins={plugins}
            onChange={this.props.onChange}
        />
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
    mapStateToProps, { addBlocks, changeHoverItem, removeHoverItem }
  ),
)(BlockEditorPresentational);
