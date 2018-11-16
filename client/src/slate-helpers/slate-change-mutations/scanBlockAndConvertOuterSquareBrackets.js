import { POINTER_EDGE_SPACE } from "../../lib/slate-pointers/exportedPointerSpacer";
import { containingInlineAncestor } from "../slate-utils/containingInlineAncestor";

export function scanBlockAndConvertOuterSquareBrackets({
  change,
  updateBlock,
  exportSelection,
  blockId,
}) {
  const value = change.value;
  const textNodes = value.document.getTexts();

  const {
    hasBalancedBrackets,
    startKey,
    startOffset,
    endKey,
    endOffset,
  } = findOutermostSquareBrackets(textNodes);

  if (hasBalancedBrackets) {
    exportBracketedSelectionFromRange({
      change,
      updateBlock,
      exportSelection,
      blockId,
      startKey,
      startOffset,
      endKey,
      endOffset,
    });
    return { wasMutationPerformed: true };
  }
  return { wasMutationPerformed: false };
}

function exportBracketedSelectionFromRange({
  change,
  updateBlock,
  exportSelection,
  blockId,
  startKey,
  startOffset,
  endKey,
  endOffset,
}) {
  const document = change.value.document;
  const node = document.getNode(startKey)
  const inlineParent = containingInlineAncestor(node, document);


  // if the starting position of the selection is right at the start of a link,
  // then Slate thinks of this position as "inside" the link, and the start of
  // the newly created pointer will (inccorectly) be nested within the link,
  // causing many problems

  // we can fix this by first detecting that we are in such a problematic
  // situation, we are in such a situation if the following
  // isLinkAtStartOfExport is true

  // we can then fix the problem by inserting a pointer edge space to the left
  // of the link (taking care to avoid inserting it within the link itself)
  // and then making sure we also export this pointer edge space, this
  // guarantees that the link is wholly nested within the export

  // the extra pointer edge space will disappear as soon as the export occurs
  // thanks to the fact the occurrences of these characters are regulated
  // and normalized by normalizeChange
  const isLinkAtStartOfExport =
    inlineParent
    &&
    inlineParent.type === "link"
    &&
    startOffset === 0;

  let insertHereToProperlyHandleLinkAtStartOfExport;
  if (isLinkAtStartOfExport) {
    insertHereToProperlyHandleLinkAtStartOfExport = document.getPreviousText(node.key);
    change
      .moveToRangeOf(insertHereToProperlyHandleLinkAtStartOfExport)
      .collapseToEnd()
      .insertText(POINTER_EDGE_SPACE);
  }

  // delete opening square bracket
  // replacing this bracket with a pointer edge space actually accomplishes
  // two things: it keeps all of the offsets the same for future calculations
  // and it allows the creation of "empty" pointers
  change
    .select({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset,
    })
    .deleteForward(1)
    .insertText(POINTER_EDGE_SPACE);

  change
    .select({
      anchorKey: endKey,
      anchorOffset: endOffset,
      focusKey: endKey,
      focusOffset: endOffset,
    })
    .deleteForward(1);

  // select everything that was within the square brackets
  if (isLinkAtStartOfExport) {
    change.select({
      anchorKey: insertHereToProperlyHandleLinkAtStartOfExport.key,
      anchorOffset: insertHereToProperlyHandleLinkAtStartOfExport.text.length,
      focusKey: endKey,
      focusOffset: endOffset,
    });
  } else {
    change.select({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: endKey,
      focusOffset: endOffset,
    });
  }

  updateBlock({ id: blockId, value: change.value, pointerChanged: false });
  exportSelection(blockId);
}

function findOutermostSquareBrackets(textNodes) {
  let startKey;
  let startOffset;
  let endKey;
  let endOffset;

  let matchFound = false;
  let squareBracketBalance = 0;

  for (let j = 0; j < textNodes.size; j++) {
    const textNode = textNodes.get(j);
    const chars = textNode.text.split("");
    let i = -1;

    while (i++ < chars.length) {
      if (chars[i] === "[") {
        squareBracketBalance++;
        if (!matchFound) {
          startKey = textNode.key;
          startOffset = i;
        }
      } else if (chars[i] === "]") {
        squareBracketBalance--;
        if (!matchFound) {
          endKey = textNode.key;
          endOffset = i;
          matchFound = true;
        } else if (squareBracketBalance < 0) {
          return { hasBalancedBrackets: false };
        }
      }
    }
  }

  if (matchFound && squareBracketBalance === 0) {
    return {
      hasBalancedBrackets: true,
      startKey,
      startOffset,
      endKey,
      endOffset,
    };
  }

  return { hasBalancedBrackets: false };
}
