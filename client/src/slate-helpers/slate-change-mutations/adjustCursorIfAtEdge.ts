import { Change } from "../../components/BlockEditor/types";
import { isCursorInPotentiallyProblematicPosition } from "../slate-utils/isCursorInPotentiallyProblematicPosition";

export function adjustCursorIfAtEdge(change: Change) {

  const value = change.value;
  const selectionIsExpanded = value.selection.isExpanded;

  if (!selectionIsExpanded && isCursorInPotentiallyProblematicPosition(value)) {
    const value = change.value;
    const { focusKey, focusOffset } = value.selection;
    const textNode = value.document.getNode(focusKey);
    const focusOffsetAtStart = focusOffset === 0;
    const focusOffsetAtEnd = focusOffset === textNode.characters.size;
    const nextTextNode = value.document.getNextText(textNode.key);
    const prevTextNode = value.document.getPreviousText(textNode.key);

    if (focusOffsetAtStart && prevTextNode) {
      change.move(1);
    }

    if (focusOffsetAtEnd && nextTextNode) {
      change.moveToRangeOf(nextTextNode)
        .collapseToStart()
        .move(1);
    }
  }

  return change;
}
