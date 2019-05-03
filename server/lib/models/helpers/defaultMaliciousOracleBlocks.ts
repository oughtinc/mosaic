import { extractPointerIdsFromQuestionValue } from "./extractPointerIdFromQuestionValue";
const uuidv4 = require("uuid/v4");

export const createMaliciousOracleDefaultBlockValues = questionValue => {
  const incorrectPointerId = uuidv4();
  const [
    questionPointerId,
    correctPointerId,
  ] = extractPointerIdsFromQuestionValue(questionValue);

  const coinflip = Math.random() < 0.5 ? "A1" : "A2";
  const scratchpadBlockValue = [
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
              text: "",
              marks: [],
            },
          ],
        },
      ],
    },
  ];

  const answerDraftBlockValue = [
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
              text: "",
              marks: [],
            },
          ],
        },
      ],
    },
  ];

  const responseBlockValue = [
    {
      object: "block",
      type: "line",
      isVoid: false,
      data: {},
      nodes: [
        {
          object: "text",
          leaves: [{ object: "leaf", text: "Ok", marks: [] }],
        },
      ],
    },
  ];

  return {
    scratchpadBlockValue,
    answerDraftBlockValue,
    responseBlockValue,
  };
};

function processNode(node: any) {
  if (node.type === "pointerImport") {
    return {
      ...node,
      data: {
        ...node.data,
        internalReferenceId: uuidv4(), // generate new id so you can open/close this independently of the one it copied
      },
    };
  } else if (node.type === "pointerExport") {
    return {
      object: "inline",
      type: "pointerImport",
      isVoid: true,
      data: {
        pointerId: node.data.pointerId,
        internalReferenceId: uuidv4(),
      },
    };
  } else if (node.nodes) {
    return {
      ...node,
      nodes: node.nodes.map(node => processNode(node)),
    };
  } else {
    return node;
  }
}

export function generateMaliciousAnswerDraftValue(questionValue, blockValue) {
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
                nodes: nodes.map(node => processNode(node)),
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
                nodes: nodes.map(node => processNode(node)),
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
