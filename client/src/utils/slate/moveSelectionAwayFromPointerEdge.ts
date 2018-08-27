import { Change } from "../../components/BlockEditor/types";

export function moveSelectionAwayFromPointerEdge(change: Change) {
  const value = change.value;
  const selection = value.selection;
  const { anchorOffset, focusOffset } = selection;

  const anchorOffsetAtStart = anchorOffset === 0;

  if (anchorOffsetAtStart) {
    if (!selection.isBackward) {
      change.moveAnchor(1);
    } else {
      change.moveAnchorToEndOfPreviousText().moveFocus(-1);
    }
  }

  const focusOffsetAtStart = focusOffset === 0;

  if (focusOffsetAtStart) {
    if (!selection.isBackward) {
      change.moveFocusToEndOfPreviousText().moveFocus(-1);
    } else {
      change.moveFocus(1);
    }
  }
}
