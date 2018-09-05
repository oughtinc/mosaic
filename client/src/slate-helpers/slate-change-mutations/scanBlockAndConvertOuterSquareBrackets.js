export function scanBlockAndConvertOuterSquareBrackets ({ change, updateBlock, exportSelection, blockId }) {
  const value = change.value;
  const textNodes = value.document.getTexts();

  const {
    balancedBrackets,
    startKey,
    startOffset,
    endKey,
    endOffset,
  } = findOutermostSquareBrackets(textNodes);

  if (balancedBrackets) {
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

function exportBracketedSelectionFromRange ({
  change,
  updateBlock,
  exportSelection,
  blockId,
  startKey,
  startOffset,
  endKey,
  endOffset,
}) {
  // delete opening square bracket
  change.select({
    anchorKey: startKey,
    anchorOffset: startOffset,
    focusKey: startKey,
    focusOffset: startOffset,
  })
  .deleteForward(1);

  // delete closing square square bracket
  // calculating achorOffset and focusOffset is complicated
  // by the fact that we need watch out for both brackets being
  // in the same text node, in which case deleting the opening square
  // bracket will have changed the offset of the closing square bracket
  change.select({
    anchorKey: endKey,
    anchorOffset: startKey === endKey ? endOffset - 1 : endOffset,
    focusKey: endKey,
    focusOffset: startKey === endKey ? endOffset - 1 : endOffset,
  })
  .deleteForward(1);

  // select everything that was within the square brackets
  change.select({
    anchorKey: startKey,
    anchorOffset: startOffset,
    focusKey: endKey,
    focusOffset: startKey === endKey ? endOffset - 1 : endOffset,
  });

  updateBlock({ id: blockId, value: change.value, pointerChanged: false });
  exportSelection(blockId);
};

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
          return { balancedBrackets: false };
        }
      }
    }
  }

  if (matchFound && squareBracketBalance === 0) {
    return {
      balancedBrackets: true,
      startKey,
      startOffset,
      endKey,
      endOffset,
    };
  }

  return { balancedBrackets: false };
}
