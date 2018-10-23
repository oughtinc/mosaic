import { hasSpacerAsFirstChar } from "../slate-utils//hasSpacerAsFirstChar";
import { hasSpacerAsLastChar } from "../slate-utils//hasSpacerAsLastChar";
import { isDirectlyAfterExport } from "../slate-utils//isDirectlyAfterExport";
import { isDirectlyBeforeExport } from "../slate-utils//isDirectlyBeforeExport";
import { isFirstTextOfExport } from "../slate-utils//isFirstTextOfExport";
import { isLastTextOfExport } from "../slate-utils//isLastTextOfExport";

import { POINTER_EDGE_SPACE } from "../../lib/slate-pointers/exportedPointerSpacer";
import { Change, TextNode } from "../../components/BlockEditor/types";

export function normalizeExportSpacing(c: Change) {
  const value = c.value;

  value.document.getTexts().forEach(textNode => {
    const getCurTextNode = () => {
      return c.value.document.getNode(textNode.key);
    }

    if (isDirectlyBeforeExport(textNode, c.value.document) && !hasSpacerAsLastChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, POINTER_EDGE_SPACE);
    }

    textNode = getCurTextNode();
    if (isDirectlyAfterExport(textNode, c.value.document) && !hasSpacerAsFirstChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, POINTER_EDGE_SPACE);
    }

    textNode = getCurTextNode();
    if (isFirstTextOfExport(textNode, c.value.document) && !hasSpacerAsFirstChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, POINTER_EDGE_SPACE);
    }

    textNode = getCurTextNode();
    if (isLastTextOfExport(textNode, c.value.document) && !hasSpacerAsLastChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, POINTER_EDGE_SPACE);
    }

    // For edge case a pointer contains two spacers, and nothing
    // else, and you delete one. Then the first and last chars are both spacers
    // since they are the same char, so you need to additionaly enforce
    // that there are at least two chars.
    textNode = getCurTextNode();
    if ((isFirstTextOfExport(textNode, c.value.document) || isLastTextOfExport(textNode, c.value.document)) && textNode.text.length === 1) {
      c.insertTextByKey(textNode.key, 0, POINTER_EDGE_SPACE);
    }

    // for edge case where there is only one spacer between two pointers,
    // you always need two so text cursor issues don't arise
    textNode = getCurTextNode();
    if ((isDirectlyAfterExport(textNode, c.value.document) && isDirectlyBeforeExport(textNode, c.value.document)) && textNode.text.length === 1) {
      c.insertTextByKey(textNode.key, 0, POINTER_EDGE_SPACE);
    }
  });

  return c;
}
