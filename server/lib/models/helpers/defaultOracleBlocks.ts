const uuidv4 = require("uuid/v4");

export const createOracleDefaultBlockValues = questionValue => {
  const a1id = uuidv4();
  const a2id = uuidv4();
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
              text: `After you create your two candidate answers, make sure you submit the prewritten question and then press "Done!" under the response field.\n----------\nA1 (${coinflip === "A1" ? "correct answer" : "plausible but wrong"}):  `, // `Instructions for oracles:\n\nFirst, create two candidate answers to the workspace question, putting the answer in the two pointers below. Please put the correct answer in the ${coinflip} pointer.\n\nSecond, when finished with your candidate answer, please submit the question.\n\nLastly, please press "Done" below the response field to record your answer and leave the workspace\n\n----------\n\nA1:  `,
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "pointerExport",
          isVoid: false,
          data: {
            pointerId: a1id,
          },
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "  ",
                  marks: [],
                },
              ],
            },
          ],
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ` \nA2 (${coinflip === "A2" ? "correct answer" : "plausible but wrong"}):  `,
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "pointerExport",
          isVoid: false,
          data: {
            pointerId: a2id,
          },
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "  ",
                  marks: [],
                },
              ],
            },
          ],
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
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
              text: "Which of the following is the best answer to  ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "pointerExport",
          isVoid: false,
          data: { pointerId: uuidv4() },
          nodes: questionValue[0].nodes.map(node => processNode(node)),
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
            pointerId: a1id,
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
          type: "pointerImport",
          isVoid: true,
          data: {
            pointerId: a2id,
            internalReferenceId: uuidv4(),
          },
          nodes: [
            {
              object: "text",
              leaves: [{ object: "leaf", text: " ", marks: [] }],
            },
          ],
        },
        { object: "text", leaves: [{ object: "leaf", text: "?", marks: [] }] },
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
          leaves: [
            { object: "leaf", text: `Answer `, marks: [] },
          ],
        },
        {
          object: "inline",
          type: "pointerImport",
          isVoid: true,
          data: {
            pointerId: coinflip === "A1" ? a1id : a2id,
            internalReferenceId: uuidv4(),
          },
          nodes: [
            {
              object: "text",
              leaves: [{ object: "leaf", text: " ", marks: [] }],
            },
          ],
        },
        { object: "text", leaves: [{ object: "leaf", text: "", marks: [] }] },
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
      }
    };
  } else if (node.type === "pointerExport") {
    return {
      object: "inline",
      type: "pointerImport",
      isVoid: true,
      data: {
        pointerId: node.data.pointerId,
        internalReferenceId: uuidv4(),
      }
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