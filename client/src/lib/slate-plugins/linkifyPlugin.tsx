import isUrl = require("is-url");
import * as React from "react";
import { getEventTransfer } from "slate-react";

function wrapLink(change: any, href: any) {
  change.wrapInline({
    type: "link",
    data: { href },
  });

  change.collapseToEnd();
}

function LinkifyPlugin() {
  return {
    onPaste: (event, change) => {
      const transfer = getEventTransfer(event);
      const { type, text } = transfer;
      if (type !== "text" && type !== "html") {
        return;
      }

      if (!isUrl(text)) {
        return;
      }

      change
        .insertText(text)
        .extend(-text.length)
        .call(wrapLink, text);

      return false;

    },

    renderNode(props: any) {
      const { attributes, children, node } = props;

      if (node.type === "link") {
        const { data } = node;
        const href = data.get("href");

        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }

      return;
    }
  };
}

export { LinkifyPlugin };
