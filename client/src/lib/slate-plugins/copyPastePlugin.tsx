import { getEventTransfer } from "slate-react";

import * as uuidv1 from "uuid/v1";

import { POINTER_EDGE_SPACE } from "../slate-pointers/exportedPointerSpacer";

export function CopyPastePlugin() {
  return {
    onPaste: (event, change) => {
      const transfer = getEventTransfer(event);
      const { fragment, text } = transfer;

      if (fragment === null) {
        change.insertText(processText(text));
        return false;
      }

      const processedInlineJSON = processDocumentJSONIntoInlineJSON(fragment.toJSON());

      change.insertInline(processedInlineJSON);
      return false;
    },
  };
}

function processDocumentJSONIntoInlineJSON(document: any) {
  let i = 0;
  let curBlock = document.nodes[i];
  let nodes = [];

  while (curBlock = document.nodes[i++]) {
    nodes = nodes.concat(curBlock.nodes.map(processNode));
  }

  return {
    object: "inline",
    type: "pasted",
    nodes,
  };
}

export function processNode(node: any) {
  if (node.type === "pointerImport") {
    return {
      ...node,
      data: {
        ...node.data,
        internalReferenceId: uuidv1(), // generate new id so you can open/close this independently of the one it copied
      }
    };
  } else if (node.type === "pointerExport") {
    return {
      object: "inline",
      type: "pasted",
      nodes: node.nodes.map(processNode),
    };
  } else if (node.object === "text") {
    return {
      object: "text",
      leaves: node.leaves.map(processNode)
    };
  } else if (node.object === "leaf") {
    return {
      object: "leaf",
      text: processText(node.text),
    };
  } else {
    return {
      ...node,
      nodes: node.nodes.map(processNode),
    };
  }
}

function processText(text: string) {
  text = text
    .split(POINTER_EDGE_SPACE)
    .join("");

  text = text
    .split("🔒")
    .join("");

  return text;
}
