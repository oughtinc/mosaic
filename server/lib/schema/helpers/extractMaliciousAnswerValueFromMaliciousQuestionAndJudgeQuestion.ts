const uuidv4 = require("uuid/v4");

export function extractMaliciousAnswerValueFromMaliciousQuestionAndJudgeQuestion(
  maliciousQuestionValue,
  judgeQuestionValue,
) {
  const honestPointerId = maliciousQuestionValue[0].nodes[3].data.pointerId;
  const firstPointerId = judgeQuestionValue[0].nodes[3].data.pointerId;
  const secondPointerId = judgeQuestionValue[0].nodes[5].data.pointerId;

  const maliciousPointerId =
    firstPointerId === honestPointerId ? secondPointerId : firstPointerId;

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
          data: {
            internalReferenceId: uuidv4(),
            pointerId: maliciousPointerId,
          },
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
