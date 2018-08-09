import { closestPointerExportAncestor } from "./closestPointerExportAncestor";
import { TextNode } from "../../components/BlockEditor/types";

export function isCursorInPotentiallyProblematicPosition(value: any) {
  function directlyBeforeExport(textNode: TextNode, document) {
    return document.getNextSibling(textNode.key) && value.document.getNextSibling(textNode.key).type === "pointerExport";
  }

  function directlyAfterExport(textNode: TextNode, document) {
    return document.getPreviousSibling(textNode.key) && value.document.getPreviousSibling(textNode.key).type === "pointerExport";
  }

  function isFirstTextOfExport(textNode: TextNode, document) {
    const parent = document.getParent(textNode.key);
    const parentIsExport = parent && parent.type === "pointerExport";

    if (!parentIsExport) {
      return false;
    }

    const firstTextOfParent = parent.getFirstText();
    return textNode === firstTextOfParent;
  }

  function isLastTextOfExport(textNode: TextNode, document) {
    const parent = document.getParent(textNode.key);
    const parentIsExport = parent && parent.type === "pointerExport";

    if (!parentIsExport) {
      return false;
    }

    const lastTextOfParent = parent.getLastText();
    return textNode === lastTextOfParent;
  }

  const textNode = value.document.getNode(value.selection.focusKey);
  const focusOffsetAtStart = value.selection.focusOffset === 0;
  const focusOffsetAtEnd = value.selection.focusOffset === textNode.characters.size;

  return (
    (directlyBeforeExport(textNode, value.document) && focusOffsetAtEnd)
    ||
    (directlyAfterExport(textNode, value.document) && focusOffsetAtStart)
    ||
    (isFirstTextOfExport(textNode, value.document) && focusOffsetAtStart)
    ||
    (isLastTextOfExport(textNode, value.document) && focusOffsetAtEnd)
  );
}
