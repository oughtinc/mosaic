const uuidv4 = require("uuid/v4");

export function extractHonestAnswerValueFromMaliciousQuestion(
  maliciousQuestionValue,
) {
  const pointerId = maliciousQuestionValue[0].nodes[3].data.pointerId;

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
