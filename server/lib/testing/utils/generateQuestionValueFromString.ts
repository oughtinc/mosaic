export function generateQuestionValueFromString(questiontext) {
  return [{
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
            text: questiontext,
            marks: []
          }
        ]
      }
    ]
  }];
};
