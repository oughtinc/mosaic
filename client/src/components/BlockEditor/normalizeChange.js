import { SPACER } from "../../lib/slate-pointers/exportedPointerSpacer";
import { Change, TextNode } from './types';

export function normalizeExportSpacing(c: Change) {
  const value = c.value;

  function isDirectlyBeforeExport(textNode: TextNode, document) {
    return document.getNextSibling(textNode.key) && value.document.getNextSibling(textNode.key).type === "pointerExport";
  }

  function isDirectlyAfterExport(textNode: TextNode, document) {
    return document.getPreviousSibling(textNode.key) && value.document.getPreviousSibling(textNode.key).type === "pointerExport";
  }

  function isFirstTextOfExport(textNode: TextNode, document) {
    const parent = document.getParent(textNode.key);
    const parentIsExport = parent && parent.type === "pointerExport";

    if (!parentIsExport) {
      return false;
    }

    const firstTextOfParent = parent.getFirstText();
    return textNode === firstTextOfParent;
  }

  function isLastTextOfExport(textNode: TextNode, document) {
    const parent = document.getParent(textNode.key);
    const parentIsExport = parent && parent.type === "pointerExport";

    if (!parentIsExport) {
      return false;
    }

    const lastTextOfParent = parent.getLastText();
    return textNode === lastTextOfParent;
  }

  function hasSpacerAsFirstChar(textNode: TextNode, document) {
    return textNode.text.charAt(0) === SPACER;
  }

  function hasSpacerAsLastChar(textNode: TextNode, document) {
    return textNode.text.charAt(textNode.text.length - 1) === SPACER;
  }

  value.document.getTexts().forEach(textNode => {
    if (isDirectlyBeforeExport(textNode, c.value.document) && !hasSpacerAsLastChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (isDirectlyAfterExport(textNode, c.value.document) && !hasSpacerAsFirstChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (isFirstTextOfExport(textNode, c.value.document) && !hasSpacerAsFirstChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (isLastTextOfExport(textNode, c.value.document) && !hasSpacerAsLastChar(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, SPACER);
    }

    // for edge case where there is only two spaces in a pointer
    // and you delete one, then first and last char are both spaces
    // since they are the same char, so you need to additionaly enforce
    // that there are at least two chars
    textNode = c.value.document.getNode(textNode.key);
    if ((isFirstTextOfExport(textNode, c.value.document) || isLastTextOfExport(textNode, c.value.document)) && textNode.text.length === 1) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }
  });

  return c;
}
