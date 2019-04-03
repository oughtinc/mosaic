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
        },],
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
            { object: "leaf", text: "As a root-level workspace, ignore the content of this field", marks: [] },
          ],
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