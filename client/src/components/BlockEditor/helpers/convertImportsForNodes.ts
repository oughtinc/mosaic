import * as uuidv1 from "uuid/v1";
import { DOLLAR_NUMBERS_REGEX } from "../../helpers/DOLLAR_NUMBERS_REGEX";

export function convertImportsForNodes(nodes: any, availablePointers: any[]) {
  const result: any = [];

  nodes.forEach(node => {
    if (node.object === "text") {
      let text: string = node.leaves[0].text; // assuming only one-leaf text nodes

      const matches = text.match(DOLLAR_NUMBERS_REGEX);

      if (!matches) {
        result.push(node);
      } else {
        matches.forEach(match => {
          const i = text.indexOf(match);
          const beforeText = text.slice(0, i);

          result.push({
            object: "text",
            leaves: [
              {
                object: "leaf",
                marks: [], // assuming no marks
                text: beforeText,
              },
            ],
          });

          const pointerIndex = Number(match.slice(1)) - 1;
          const associatedExport = availablePointers[pointerIndex];

          if (associatedExport) {
            result.push({
              object: "inline",
              type: "pointerImport",
              isVoid: true,
              data: {
                internalReferenceId: uuidv1(),
                pointerId: associatedExport.data.pointerId,
              },
            });
          }

          text = text.slice(i + match.length); // remove text already processed
        });

        // this adds any text after the last converted import
        result.push({
          object: "text",
          leaves: [
            {
              object: "leaf",
              marks: [],
              text,
            },
          ],
        });
      }
    } else if (node.object === "inline") {
      result.push({
        ...node,
        nodes: convertImportsForNodes(node.nodes, availablePointers),
      });
    } else {
      result.push(node);
    }
  });

  return result;
}
