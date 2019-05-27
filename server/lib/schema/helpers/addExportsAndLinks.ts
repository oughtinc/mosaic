import * as uuidv1 from "uuid/v1";

const SQUARE_BRACKET_MATCH = /\[.*\]/g;
const STAR_MATCH = /\*.*\*/g;

export function addExportsAndLinks(nodes) {
  return addLinks(addExports(nodes));
}

export function addExports(nodes) {
  const result: any = [];

  nodes.forEach(node => {
    if (node.object === "text") {
      let text: string = node.leaves[0].text; // assuming only one-leaf text nodes

      const matches = text.match(SQUARE_BRACKET_MATCH);

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

          result.push({
            object: "inline",
            type: "pointerExport",
            data: {
              pointerId: uuidv1(),
            },
            nodes: addExportsAndLinks([
              {
                object: "text",
                leaves: [
                  {
                    object: "leaf",
                    text: text.slice(i + 1, i + match.length - 1),
                  },
                ],
              },
            ]),
          });

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
    } else if (node.object === "inline" || node.object === "block") {
      result.push({
        ...node,
        nodes: addExportsAndLinks(node.nodes),
      });
    } else {
      result.push(node);
    }
  });

  return result;
}

export function addLinks(nodes) {
  const result: any = [];

  nodes.forEach(node => {
    if (node.object === "text") {
      let text: string = node.leaves[0].text; // assuming only one-leaf text nodes

      const matches = text.match(STAR_MATCH);

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

          result.push({
            object: "inline",
            type: "link",
            data: {
              href: text.slice(i + 1, i + match.length - 1),
            },
            nodes: [
              {
                object: "text",
                leaves: [
                  {
                    object: "leaf",
                    text: text.slice(i + 1, i + match.length - 1),
                  },
                ],
              },
            ],
          });

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
    } else if (node.object === "inline" || node.object === "block") {
      result.push({
        ...node,
        nodes: addExportsAndLinks(node.nodes),
      });
    } else {
      result.push(node);
    }
  });

  return result;
}
