const uuidv4 = require("uuid/v4");

import { extractPointerIdsFromQuestionValue } from "./extractPointerIdFromQuestionValue";
import { processExportsToImports } from "./processExportsToImports";

export function generateJudgeQuestionValue(questionValue, blockValue) {
  const nodes = blockValue[0].nodes;

  const [
    questionPointerId,
    correctPointerId,
  ] = extractPointerIdsFromQuestionValue(questionValue);

  const coinflip = Math.random() < 0.5 ? "A1" : "A2";

  const answerDraftBlockValue =
    coinflip === "A1"
      ? [
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
                    text: "Which is a better answer to Q ",
                    marks: [],
                  },
                ],
              },
              {
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                  pointerId: questionPointerId,
                  internalReferenceId: uuidv4(),
                },
                nodes: [
                  {
                    object: "text",
                    leaves: [{ object: "leaf", text: " ", marks: [] }],
                  },
                ],
              },
              {
                object: "text",
                leaves: [{ object: "leaf", text: " ? A1 ", marks: [] }],
              },
              {
                object: "inline",
                type: "pointerExport",
                isVoid: false,
                data: { pointerId: uuidv4() },
                nodes: nodes.map(node => processExportsToImports(node)),
              },
              {
                object: "text",
                leaves: [{ object: "leaf", text: " or A2 ", marks: [] }],
              },
              {
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                  pointerId: correctPointerId,
                  internalReferenceId: uuidv4(),
                },
                nodes: [
                  {
                    object: "text",
                    leaves: [{ object: "leaf", text: " ", marks: [] }],
                  },
                ],
              },
              {
                object: "text",
                leaves: [{ object: "leaf", text: "?", marks: [] }],
              },
            ],
          },
        ]
      : [
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
                    text: "Which is a better answer to Q ",
                    marks: [],
                  },
                ],
              },
              {
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                  pointerId: questionPointerId,
                  internalReferenceId: uuidv4(),
                },
                nodes: [
                  {
                    object: "text",
                    leaves: [{ object: "leaf", text: " ", marks: [] }],
                  },
                ],
              },
              {
                object: "text",
                leaves: [{ object: "leaf", text: " ? A1 ", marks: [] }],
              },
              {
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                  pointerId: correctPointerId,
                  internalReferenceId: uuidv4(),
                },
                nodes: [
                  {
                    object: "text",
                    leaves: [{ object: "leaf", text: " ", marks: [] }],
                  },
                ],
              },

              {
                object: "text",
                leaves: [{ object: "leaf", text: " or A2 ", marks: [] }],
              },
              {
                object: "inline",
                type: "pointerExport",
                isVoid: false,
                data: { pointerId: uuidv4() },
                nodes: nodes.map(node => processExportsToImports(node)),
              },
              {
                object: "text",
                leaves: [{ object: "leaf", text: "?", marks: [] }],
              },
            ],
          },
        ];

  return answerDraftBlockValue;
}
