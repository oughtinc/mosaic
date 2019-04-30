import { TextNode } from "../../components/BlockEditor/types";

export function isDirectlyAfterExport(textNode: TextNode, document: any) {
  return (
    document.getPreviousSibling(textNode.key) &&
    document.getPreviousSibling(textNode.key).type === "pointerExport"
  );
}
