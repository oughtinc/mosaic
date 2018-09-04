import { closestPointerExportAncestor } from "./closestPointerExportAncestor";

export function isSelectionAcrossPointers(selection, document) {
  const { anchorKey, focusKey } = selection;
  const anchorNode = document.getNode(anchorKey);
  const focusNode = document.getNode(focusKey);

  const closestPointerExportAncestorOfAnchorNode = closestPointerExportAncestor(anchorNode, document);
  const closestPointerExportAncestorOfFocusNode = closestPointerExportAncestor(focusNode, document);

  if (closestPointerExportAncestorOfAnchorNode !== closestPointerExportAncestorOfFocusNode) {
    return true;
  }

  return false;
}
