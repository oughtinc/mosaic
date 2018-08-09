import { SPACER } from "../../lib/slate-pointers/exportedPointerSpacer";
import { TextNode } from "../../components/BlockEditor/types";

export function hasSpacerAsFirstChar(textNode: TextNode, document: any) {
  return textNode.text.charAt(0) === SPACER;
}
