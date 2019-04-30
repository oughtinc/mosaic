export const createDefaultRootLevelBlockValues = () => {
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
              text: " ",
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
