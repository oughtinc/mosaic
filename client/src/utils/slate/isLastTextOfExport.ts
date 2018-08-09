import { TextNode } from "../../components/BlockEditor/types";

export function isLastTextOfExport(textNode: TextNode, document: any) {
  const parent = document.getParent(textNode.key);
  const parentIsExport = parent && parent.type === "pointerExport";

  if (!parentIsExport) {
    return false;
  }

  const lastTextOfParent = parent.getLastText();
  return textNode === lastTextOfParent;
}
