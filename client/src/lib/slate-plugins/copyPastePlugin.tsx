import { Document } from "slate";
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

      const documentAsJSON = fragment.toJSON();
      const processedDocumentAsJSON = processDocumentJSON(documentAsJSON, false);

      change.insertFragment(Document.fromJSON(processedDocumentAsJSON));
      return false;
    },
  };
}

function processDocumentJSON(document: any, shouldConvertExportsToImports = true) {
  return {
    ...document,
    nodes: document.nodes.map(node => processNode(node, shouldConvertExportsToImports)),
  };
}

export function processNode(node: any, shouldConvertExportsToImports) {
  if (node.type === "pointerImport") {
    return {
      ...node,
      data: {
        ...node.data,
        internalReferenceId: uuidv1(), // generate new id so you can open/close this independently of the one it copied
      }
    };
  } else if (node.type === "pointerExport") {
    if (shouldConvertExportsToImports) {
      return {
        object: "inline",
        type: "pointerImport",
        isVoid: true,
        data: {
          pointerId: node.data.pointerId,
          internalReferenceId: uuidv1(),
        }
      };
    } else {
      return {
        ...node,
        data: {
          ...node.data,
          pointerId: uuidv1(), // generate new id so it's distinct export
        },
        nodes: node.nodes.map(node => processNode(node, shouldConvertExportsToImports)),
      };
    }
  } else if (node.nodes) {
    return {
      ...node,
      nodes: node.nodes.map(node => processNode(node, shouldConvertExportsToImports)),
    };
  } else {
    return node;
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
