import { containingPointerExportAncestor } from "./containingPointerExportAncestor";

export function isSelectionAcrossPointers(value) {
  const { document, selection } = value;
  const { anchorKey, focusKey } = selection;

  const containingPointerExportAncestorByKey =
    key => containingPointerExportAncestor(document.getNode(key), document);

  return (
    containingPointerExportAncestorByKey(anchorKey)
    !==
    containingPointerExportAncestorByKey(focusKey) 
  );
}
