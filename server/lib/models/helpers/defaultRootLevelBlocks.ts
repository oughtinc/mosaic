export const createDefaultRootLevelBlockValues = () => {
  const answerDraftBlockValue = [
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
    answerDraftBlockValue,
  };
};
