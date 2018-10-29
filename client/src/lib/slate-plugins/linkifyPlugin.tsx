// Adapted from this https://github.com/ianstormtaylor/slate/blob/3528bb7366f5b87a14fe9adef65a42d2e0eb712f/examples/links/index.js
import isUrl = require("is-url");
import * as React from "react";
import { getEventTransfer } from "slate-react";

function wrapLink(change: any, href: any) {
  change.insertInline({
    type: "link",
    data: { href },
    nodes: [
      {
        object: "text",
        leaves: [
          {
            object: "leaf",
            text: href
          }
        ]
      }
    ]
  });

  change.collapseToEnd();
}

function LinkifyPlugin() {
  return {
    onPaste: (event, change) => {
      // this gets Slate-related info concerning event
      const transfer = getEventTransfer(event);

      // possible Slate types include 'fragment' , 'html' , 'node' , 'rich' , or 'text'
      const { type, text } = transfer;

      // we only want to linkify text or html
      const pastedContentIsNeitherTextNorHtml =
        type !== "text" && type !== "html";

      if (pastedContentIsNeitherTextNorHtml) {
        return;
      }

      const pastedTextDoesFormsAURL = isUrl(text);

      if (pastedTextDoesFormsAURL) {
        change
          .insertText(text)
          .extend(-text.length)
          .call(wrapLink, text);

        return false;
      }

      return;
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
