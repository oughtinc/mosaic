import * as React from "react";
import { getEventTransfer } from "slate-react";

import { POINTER_EDGE_SPACE } from "../slate-pointers/exportedPointerSpacer";

function CopyPastePlugin() {
  return {
    onPaste: (event, change) => {
      const transfer = getEventTransfer(event);
      const { text } = transfer;
      const strippedText = text.split('').filter(c => c !== POINTER_EDGE_SPACE).join('');
      change.insertText(strippedText);
      return false;
    },
  };
}

export { CopyPastePlugin };
