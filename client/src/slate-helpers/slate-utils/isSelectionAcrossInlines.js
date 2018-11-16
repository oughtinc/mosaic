import { containingInlineAncestor } from "./containingInlineAncestor";

export function isSelectionAcrossInlines(value) {
  const { document, selection } = value;
  const { anchorKey, focusKey } = selection;

  const containingInlineByKey =
    key => containingInlineAncestor(document.getNode(key), document);

  return (
    containingInlineByKey(anchorKey)
    !==
    containingInlineByKey(focusKey)
  );
}
