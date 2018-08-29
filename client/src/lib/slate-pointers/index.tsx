import * as React from "react";
import { PointerExportMark } from "./PointerExportMark";
import { PointerImportNode } from "./PointerImportNode";
import { isCursorInPotentiallyProblematicPosition } from "../../utils/slate/isCursorInPotentiallyProblematicPosition";
import { handleCursorNavigationAcrossPointerEdge } from "../../utils/slate/handleCursorNavigationAcrossPointerEdge";

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
        window.setTimeout(() => {
          options.onSelectNull();
        }, 10);
        return;
      }

      const { left, right, top, bottom } = rect;
      window.setTimeout(() => {
        options.onSelect({ left, right, top, bottom });
      }, 10);
    },

    shouldNodeComponentUpdate(a: object, b: object) {
      return true;
    },

    // handles moving cursor across spacer characters
    onKeyDown(event: any, change: any, editor: any) {
      const isMovingLeft = event.key === "ArrowLeft" || event.key === "Backspace";
      const isMovingRight = event.key === "ArrowRight";

      // simulate the inteded move to the left or right
      // because they are simulated we don't use the original change object

      let valueAfterSimulatedChange = change.value;

      if (isMovingLeft) {
        valueAfterSimulatedChange = valueAfterSimulatedChange.change().move(-1).value;
      }

      if (isMovingRight) {
        valueAfterSimulatedChange = valueAfterSimulatedChange.change().move(1).value;
      }

      if (isCursorInPotentiallyProblematicPosition(valueAfterSimulatedChange)) {
        handleCursorNavigationAcrossPointerEdge({
          change,
          value: valueAfterSimulatedChange,
          isMovingLeft,
          isMovingRight,
        });
        event.preventDefault();
        return false;
      }
      return;
    },

    renderNode(props: any) {
      const { children, node } = props; // { attributes, isSelected }
      if (node.type === "pointerExport") {
        const nodeAsJson = node.toJSON();
        const pointer =
          options.availablePointers.find(
            p => p.data.pointerId === nodeAsJson.data.pointerId
          ) || {};
        return (
          <PointerExportMark
            blockEditor={options.blockEditor}
            nodeAsJson={nodeAsJson}
            availablePointers={options.availablePointers}
            onMouseOver={({ left, right, top, bottom }) => {
              options.onMouseOverPointerExport({
                left,
                right,
                top,
                bottom,
                readOnly: pointer.readOnly,
                id: nodeAsJson.data.pointerId
              });
            }}
            children={children}
          />
        );
      }
      if (node.type === "text") {
        return <span>{children}</span>;
      }
      if (node.type === "pointerImport") {
        return (
          <PointerImportNode
            nodeAsJson={node.toJSON()}
            blockEditor={options.blockEditor}
            availablePointers={options.availablePointers}
            onMouseOver={({ left, right, top, bottom, id }) => {
              options.onMouseOverPointerImport({
                left,
                right,
                top,
                bottom,
                id
              });
            }}
            isHoverable={true}
          />
        );
      } else {
        return;
      }
    }
  };
}

export { SlatePointers };
