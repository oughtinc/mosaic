import { Change, Value } from "../../components/BlockEditor/types";

export function handleCursorNavigationAcrossPointerEdge({
  change,
  value,
  isMovingLeft,
  isMovingRight,
}: any) {

  const textNode = value.document.getNode(value.selection.focusKey);
  const nextTextNode = value.document.getNextText(textNode.key);
  const prevTextNode = value.document.getPreviousText(textNode.key);
  const focusOffsetAtStart = value.selection.focusOffset === 0;
  const focusOffsetAtEnd = value.selection.focusOffset === textNode.characters.size;

  if (focusOffsetAtStart && isMovingLeft && prevTextNode) {
    change
      .moveToRangeOf(prevTextNode)
      .collapseToEnd()
      .move(-1);
  }

  if (focusOffsetAtEnd && isMovingRight && nextTextNode) {
    change
      .moveToRangeOf(nextTextNode)
      .collapseToStart()
      .move(1);
  }

  return change;
}
