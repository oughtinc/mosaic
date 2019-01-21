import { Document } from "slate";
import { getEventTransfer } from "slate-react";

import * as uuidv1 from "uuid/v1";

import { isSelectionInExport } from "../../slate-helpers/slate-utils/isSelectionInExport";

import { POINTER_EDGE_SPACE } from "../slate-pointers/exportedPointerSpacer";
import {
  CONVERT_PASTED_EXPORT_TO_IMPORT,
  CONVERT_PASTED_EXPORT_TO_NEW_EXPORT,
} from "../../constants";

export function CopyPastePlugin({ pastedExportFormat }: { pastedExportFormat: string}) {
  return {
    onPaste: (event, change) => {
      const transfer = getEventTransfer(event);
      const { fragment, text } = transfer;

      const isInExport = isSelectionInExport(change.value);

      if (fragment === null || isInExport) {
        change.insertText(processText(text));
        return false;
      }

      const documentAsJSON = fragment.toJSON();
      const processedDocumentAsJSON = processDocumentJSON(documentAsJSON, pastedExportFormat);

      change.insertFragment(Document.fromJSON(processedDocumentAsJSON));
      return false;
    },
  };
}

function processDocumentJSON(document: any, pastedExportFormat: string = CONVERT_PASTED_EXPORT_TO_IMPORT) {
  return {
    ...document,
    nodes: document.nodes.map(node => processNode(node, pastedExportFormat)),
  };
}

export function processNode(node: any, pastedExportFormat: string) {
  if (node.type === "pointerImport") {
    return {
      ...node,
      data: {
        ...node.data,
        internalReferenceId: uuidv1(), // generate new id so you can open/close this independently of the one it copied
      }
    };
  } else if (node.type === "pointerExport") {
    if (pastedExportFormat === CONVERT_PASTED_EXPORT_TO_IMPORT) {
      return {
        object: "inline",
        type: "pointerImport",
        isVoid: true,
        data: {
          pointerId: node.data.pointerId,
          internalReferenceId: uuidv1(),
        }
      };
    } else if (pastedExportFormat === CONVERT_PASTED_EXPORT_TO_NEW_EXPORT) {
      return {
        ...node,
        data: {
          ...node.data,
          pointerId: uuidv1(), // generate new id so it's distinct export
        },
        nodes: node.nodes.map(node => processNode(node, pastedExportFormat)),
      };
    }
  } else if (node.nodes) {
    return {
      ...node,
      nodes: node.nodes.map(node => processNode(node, pastedExportFormat)),
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
