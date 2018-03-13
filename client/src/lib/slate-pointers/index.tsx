import styled from "styled-components";
import React = require("react");
import ReactDOM = require("react-dom");
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportMark } from "./PointerImportMark";
import _ = require("lodash");
import { HOVER_ITEM_TYPES } from "../../modules/blockEditor/actions";

function SlatePointers(options: any = {}) {
  return {
    onSelect(event: any, change: any, editor: any) {
      const { value } = editor.props;
      if (value.isBlurred || value.isEmpty) {
        return;
      }

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0) {
        window.setTimeout(
          () => {
            options.onSelectNull();
          }, 10);
        return;
      }

      const _top = `${(rect.top - 44).toFixed(2)}px`;
      const _left = `${(rect.left.toFixed(2))}px`;
      window.setTimeout(
        () => {
          options.onSelect({ top: _top, left: _left });
        }, 10
      );
    },

    shouldNodeComponentUpdate(a, b) {
      return true;
    },

    renderNode(props: any) {
      const { attributes, children, node, isSelected } = props;
      if (node.type === "pointerImport") {
        const { internalReferenceId, pointerId } = node.toJSON().data;
        const reference = options.blockEditor.pointerReferences[internalReferenceId];
        const isOpen = reference && reference.isOpen;
        const isSelected = options.blockEditor.hoveredItem.id === internalReferenceId;
        const importingPointer: any = options.exportingPointers.find((l: any) => l.pointerId === pointerId);
        const pointerIndex = _.findIndex(options.exportingPointers, (l: any) => l.pointerId === pointerId);
        return (
          <PointerImportMark
            mark={node.toJSON()}
            blockId={options.blockId}
            importingPointer={importingPointer}
            isOpen={isOpen}
            isSelected={isSelected}
            pointerIndex={pointerIndex}
            changeHoverItem={options.changeHoverItem}
          />
        );
      } else {
        return;
      }
    },

    renderMark(props) {
      const { children, mark, blockId } = props;
      switch (mark.type) {
        case "pointerExport":
          return (
            <PointerExportMark
              mark={mark.toJSON()}
              blockId={options.blockId}
              blockEditor={options.blockEditor}
              changeHoverItem={({ top, left }) => {
                options.changeHoverItem({
                  hoverItemType: HOVER_ITEM_TYPES.POINTER_EXPORT,
                  id: mark.toJSON().data.pointerId,
                  top,
                  left,
                  blockId: options.blockId,
                });
              }}
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
    },

  };
}

export {SlatePointers};