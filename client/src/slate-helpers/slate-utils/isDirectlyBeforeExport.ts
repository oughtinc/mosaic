import { TextNode } from "../../components/BlockEditor/types";

export function isDirectlyBeforeExport(textNode: TextNode, document: any) {
  return document.getNextSibling(textNode.key) && document.getNextSibling(textNode.key).type === "pointerExport";
}
