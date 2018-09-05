import { containingPointerExportAncestor } from "./containingPointerExportAncestor";

export function isSelectionAcrossPointers(value) {
  const { document, selection } = value;
  const { anchorKey, focusKey } = selection;
  const anchorNode = document.getNode(anchorKey);
  const focusNode = document.getNode(focusKey);

  const containingPointerExportAncestorOfAnchorNode = containingPointerExportAncestor(anchorNode, document);
  const containingPointerExportAncestorOfFocusNode = containingPointerExportAncestor(focusNode, document);

  if (containingPointerExportAncestorOfAnchorNode !== containingPointerExportAncestorOfFocusNode) {
    return true;
  }

  return false;
}
