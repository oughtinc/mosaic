import { POINTER_EDGE_SPACE } from "../../lib/slate-pointers/exportedPointerSpacer";
import { TextNode } from "../../components/BlockEditor/types";

export function hasSpacerAsFirstChar(textNode: TextNode, document: any) {
  return textNode.text.charAt(0) === POINTER_EDGE_SPACE;
}
