import * as React from "react";
import { Editor } from "slate-react";
import { addBlocks, removeBlocks } from "../../modules/blocks/actions";
import {
  changeHoverItem,
  removeHoverItem,
  HOVER_ITEM_TYPES,
} from "../../modules/blockEditor/actions";
import { compose } from "recompose";
import { connect } from "react-redux";
import SoftBreak from "slate-soft-break";
import { SlatePointers } from "../../lib/slate-pointers";
import { CopyPastePlugin } from "../../lib/slate-plugins/copyPastePlugin";
import { LinkifyPlugin } from "../../lib/slate-plugins/linkifyPlugin";
import { BlockEditorEditing } from "./BlockEditorEditing";
import * as _ from "lodash";

class BlockEditorPresentational extends React.Component<any, any> {
  public menu;
  public blockEditorEditing;

  public constructor(props: any) {
    super(props);
    this.state = {
      plugins: [],
    };
  }

  public componentWillMount() {
    this.resetPlugins(this.props);
  }

  public shouldComponentUpdate(newProps: any) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(newProps.block, this.props.block) ||
      !_.isEqual(
        newProps.exportLockStatusInfo,
        this.props.exportLockStatusInfo,
      ) ||
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds) ||
      !_.isEqual(newProps.shouldAutoExport, this.props.shouldAutoExport) ||
      !_.isEqual(newProps.pastedExportFormat, this.props.pastedExportFormat)
    ) {
      return true;
    }
    return false;
  }

  public editor = () => {
    return this.blockEditorEditing && this.blockEditorEditing.editor;
  };

  public componentWillReceiveProps(newProps: any) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(
        newProps.exportLockStatusInfo,
        this.props.exportLockStatusInfo,
      ) ||
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds) ||
      !_.isEqual(newProps.pastedExportFormat, this.props.pastedExportFormat)
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
          readOnly: null,
          blockId: newProps.blockId,
        });
      },
      onMouseOverPointerExport: ({ top, left, id, readOnly }) => {
        newProps.changeHoverItem({
          hoverItemType: HOVER_ITEM_TYPES.POINTER_EXPORT,
          id,
          top,
          left,
          readOnly,
          blockId: newProps.blockId,
        });
      },
      onMouseOverPointerImport: ({ top, left, id }) => {
        newProps.changeHoverItem({
          hoverItemType: HOVER_ITEM_TYPES.POINTER_IMPORT,
          id,
          top,
          left,
          readOnly: null,
          blockId: false,
        });
      },
      blockEditor: newProps.blockEditor,
      availablePointers: newProps.availablePointers,
      visibleExportIds: newProps.visibleExportIds,
      exportLockStatusInfo: newProps.exportLockStatusInfo,
      unlockPointer: newProps.unlockPointer,
      isInOracleModeAndIsUserOracle: true && newProps.isUserOracle,
      isInOracleMode: true,
      isUserOracle: newProps.isUserOracle,
      isActive: newProps.isActive,
      idOfHonestAnswerCandidate: newProps.idOfHonestAnswerCandidate,
      idOfMaliciousAnswerCandidate: newProps.idOfMaliciousAnswerCandidate,
      isAwaitingHonestExpertDecision: newProps.isAwaitingHonestExpertDecision,
    };
    this.setState({
      plugins: [
        LinkifyPlugin(),
        CopyPastePlugin({ pastedExportFormat: newProps.pastedExportFormat }),
        SoftBreak({}),
        SlatePointers(SlatePointerInputs),
      ],
    });
  }

  public componentDidMount() {
    const { name, blockId, initialValue, workspaceId } = this.props;

    const blockForm = {
      id: blockId,
      name,
      value: initialValue,
      workspaceId,
    };

    this.props.addBlocks([blockForm]);
    this.resetPlugins(this.props);
  }

  public componentWillUnmount() {
    if (this.props.dontRemoveBlocksOnUnount) {
      return;
    }

    const { blockId } = this.props;
    this.props.removeBlocks([blockId]);
  }

  public onChange(value: any) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const hoverMenu = document.getElementById("hover-menu");
    if (!hoverMenu) {
      return;
    }

    if (
      _.isElement(event.relatedTarget) &&
      hoverMenu.contains(event.relatedTarget as Node)
    ) {
      return;
    }

    this.props.removeHoverItem();
  };

  public renderEditor(block: any) {
    const { readOnly } = this.props;
    const value = block.value;
    const { plugins } = this.state;
    return readOnly ? (
      <Editor value={value} readOnly={true} plugins={plugins} />
    ) : (
      <BlockEditorEditing
        placeholder={this.props.placeholder}
        value={value}
        readOnly={true}
        shouldAutosave={!!this.props.shouldAutosave}
        block={this.props.block}
        availablePointers={this.props.availablePointers}
        visibleExportIds={this.props.visibleExportIds}
        exportLockStatusInfo={this.props.exportLockStatusInfo}
        plugins={plugins}
        onChange={this.props.onChange}
        onKeyDown={this.props.onKeyDown}
        onMount={input => {
          this.blockEditorEditing = input;
        }}
        cyAttributeName={this.props.cyAttributeName}
        shouldAutoExport={this.props.shouldAutoExport}
        pastedExportFormat={this.props.pastedExportFormat}
      />
    );
  }

  public render() {
    const block = this.props.block;
    if (!block) {
      return <div> loading... </div>;
    }
    return (
      <div onMouseLeave={this.handleMouseLeave}>{this.renderEditor(block)}</div>
    );
  }
}

function mapStateToProps(state: any, { blockId }: any) {
  const { blocks, blockEditor } = state;
  const block = blocks.blocks.find(b => b.id === blockId);
  return { block, blockEditor };
}

export const BlockEditor: any = compose(
  connect(
    mapStateToProps,
    { addBlocks, removeBlocks, changeHoverItem, removeHoverItem },
    null,
    { withRef: true },
  ),
)(BlockEditorPresentational);
