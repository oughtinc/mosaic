const uuidv4 = require("uuid/v4");

import { processExportsToImports } from "./processExportsToImports";

export function generateMaliciousQuestionValue(questionValue, blockValue) {
  const nodes = blockValue[0].nodes;

  const maliciousQuestionBlockValue = [
    {
      object: "block",
      type: "line",
      isVoid: false,
      data: {},
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "The honest expert has responded to question ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "pointerExport",
          isVoid: false,
          data: { pointerId: uuidv4() },
          nodes: questionValue[0].nodes.map(node =>
            processExportsToImports(node),
          ),
        },
        {
          object: "text",
          leaves: [{ object: "leaf", text: " with answer ", marks: [] }],
        },
        {
          object: "inline",
          type: "pointerExport",
          isVoid: false,
          data: { pointerId: uuidv4() },
          nodes: nodes.map(node => processExportsToImports(node)),
        },
        { object: "text", leaves: [{ object: "leaf", text: ".", marks: [] }] },
      ],
    },
  ];

  return maliciousQuestionBlockValue;
}
