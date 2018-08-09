import { closestPointerExportAncestor } from "./closestPointerExportAncestor";

export function isCursorInPotentiallyProblematicPosition(value: any) {
  const textNode = value.document.getNode(value.selection.focusKey);
  const nextTextNode = value.document.getNextText(textNode.key);
  const prevTextNode = value.document.getPreviousText(textNode.key);

  const directlyAfterPointer =
    prevTextNode
    &&
    closestPointerExportAncestor(prevTextNode, value.document)
    &&
    closestPointerExportAncestor(prevTextNode, value.document).type === "pointerExport";

  const directlyBeforePointer =
    nextTextNode
    &&
    closestPointerExportAncestor(nextTextNode, value.document)
    &&
    closestPointerExportAncestor(nextTextNode, value.document).type === "pointerExport";

  const nowInPointer = closestPointerExportAncestor(textNode, value.document) !== undefined;

  const focusOffsetAtStart = value.selection.focusOffset === 0;
  const focusOffsetAtEnd = value.selection.focusOffset === textNode.characters.size;

  return nowInPointer || (directlyAfterPointer && focusOffsetAtStart) || (directlyBeforePointer && focusOffsetAtEnd);
}
