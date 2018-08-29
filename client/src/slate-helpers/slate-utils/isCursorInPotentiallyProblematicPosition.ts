import { isDirectlyAfterExport } from "./isDirectlyAfterExport";
import { isDirectlyBeforeExport } from "./isDirectlyBeforeExport";
import { isFirstTextOfExport } from "./isFirstTextOfExport";
import { isLastTextOfExport } from "./isLastTextOfExport";

export function isCursorInPotentiallyProblematicPosition(value: any) {

  const textNode = value.document.getNode(value.selection.focusKey);
  const focusOffsetAtStart = value.selection.focusOffset === 0;
  const focusOffsetAtEnd = value.selection.focusOffset === textNode.characters.size;

  return (
    (isDirectlyBeforeExport(textNode, value.document) && focusOffsetAtEnd)
    ||
    (isDirectlyAfterExport(textNode, value.document) && focusOffsetAtStart)
    ||
    (isFirstTextOfExport(textNode, value.document) && focusOffsetAtStart)
    ||
    (isLastTextOfExport(textNode, value.document) && focusOffsetAtEnd)
  );
}
