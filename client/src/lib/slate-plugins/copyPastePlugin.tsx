import { getEventTransfer } from "slate-react";

import { POINTER_EDGE_SPACE } from "../slate-pointers/exportedPointerSpacer";

function CopyPastePlugin() {
  return {
    onPaste: (event, change) => {
      const transfer = getEventTransfer(event);
      let { text } = transfer;

      text = text
        .split(POINTER_EDGE_SPACE)
        .join("");

      text = text
        .split("🔒")
        .join("");

      change.insertText(text);

      return false;
    },
  };
}

export { CopyPastePlugin };
