export function isSelectionExpanded(selection) {
  const { anchorKey, anchorOffset, focusKey, focusOffset } = selection;

  const anchorAndFocusInDifferentNodes = anchorKey !== focusKey;

  if (anchorAndFocusInDifferentNodes) {
    return true;
  }

  // If we've reached here, we know anchor and focus are in the same node
  const anchorAndFocusHaveDifferentOffsets = anchorOffset !== focusOffset;

  if (anchorAndFocusHaveDifferentOffsets) {
    return true;
  }

  // If we've reached here, we know anchor and focus are in the same node,
  // and within that node they have the same offset. This means the
  // selection is not expanded.
  return false;
}
