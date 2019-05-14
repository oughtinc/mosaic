const uuidv4 = require("uuid/v4");

export function extractAnswerValueFromQuestion(questionValue, number) {
  const pointerId = questionValue[0].nodes[number * 2 + 1].data.pointerId;

  const blockValue = [
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
              text: "A ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "pointerImport",
          isVoid: true,
          data: { internalReferenceId: uuidv4(), pointerId },
        },
        {
          object: "text",
          leaves: [{ object: "leaf", text: "", marks: [] }],
        },
      ],
    },
  ];

  return blockValue;
}
