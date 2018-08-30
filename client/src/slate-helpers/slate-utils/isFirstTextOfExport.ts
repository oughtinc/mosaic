import { TextNode } from "../../components/BlockEditor/types";

export function isFirstTextOfExport(textNode: TextNode, document: any) {
  const parent = document.getParent(textNode.key);
  const parentIsExport = parent && parent.type === "pointerExport";

  if (!parentIsExport) {
    return false;
  }

  const firstTextOfParent = parent.getFirstText();
  return textNode === firstTextOfParent;
}
