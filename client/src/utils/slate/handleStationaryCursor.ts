import { Change } from "../../components/BlockEditor/types";

export function handleStationaryCursor(change: Change) {
  const value = change.value;
  const { focusKey, focusOffset } = value.selection;
  const textNode = value.document.getNode(focusKey);
  const focusOffsetAtStart = focusOffset === 0;
  const focusOffsetAtEnd = focusOffset === textNode.characters.size;
  const nextTextNode = value.document.getNextText(textNode.key);
  const prevTextNode = value.document.getPreviousText(textNode.key);

  if (focusOffsetAtStart && prevTextNode) {
    change.moveToRangeOf(prevTextNode)
      .collapseToEnd()
      .move(-1);
  }

  if (focusOffsetAtEnd && nextTextNode) {
    change.moveToRangeOf(nextTextNode)
      .collapseToStart()
      .move(1);
  }

  return change;
}
