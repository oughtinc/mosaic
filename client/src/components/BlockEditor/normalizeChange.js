import { SPACER } from "../../lib/slate-pointers/exportedPointerSpacer";
import { Change, TextNode } from './types';

export function normalizeExportSpacing(c: Change) {
  const value = c.value;

  function directlyBeforeExport(textNode: TextNode, document) {
    return document.getNextSibling(textNode.key) && value.document.getNextSibling(textNode.key).type === "pointerExport";
  }

  function directlyAfterExport(textNode: TextNode, document) {
    return document.getPreviousSibling(textNode.key) && value.document.getPreviousSibling(textNode.key).type === "pointerExport";
  }

  function insideExport(textNode: TextNode, document) {
    return document.getParent(textNode.key) && value.document.getParent(textNode.key).type === "pointerExport";
  }

  function firstCharIsSpacer(textNode: TextNode, document) {
    return textNode.text.charAt(0) === SPACER;
  }

  function lastCharIsSpacer(textNode: TextNode, document) {
    return textNode.text.charAt(textNode.text.length - 1) === SPACER;
  }

  value.document.getTexts().forEach(textNode => {
    if (!insideExport(textNode, c.value.document) && directlyBeforeExport(textNode, c.value.document) && !lastCharIsSpacer(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (!insideExport(textNode, c.value.document) && directlyAfterExport(textNode, c.value.document) && !firstCharIsSpacer(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (insideExport(textNode, c.value.document) && !firstCharIsSpacer(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }

    textNode = c.value.document.getNode(textNode.key);
    if (insideExport(textNode, c.value.document) && !lastCharIsSpacer(textNode, c.value.document)) {
      c.insertTextByKey(textNode.key, textNode.text.length, SPACER);
    }

    // for edge case where there is only two spaces in a pointer
    // and you delete one, then first and last char are both spaces
    // since they are the same char, so you need to additionaly enforce
    // that there are at least two chars
    textNode = c.value.document.getNode(textNode.key);
    if (insideExport(textNode, c.value.document) && textNode.text.length === 1) {
      c.insertTextByKey(textNode.key, 0, SPACER);
    }
  });

  return c;
}
