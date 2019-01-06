const uuidv4 = require("uuid/v4");
import * as models from "../models";

const generateQuestionValueFromString = questiontext => {
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

export async function seedDbForTesting() {
  const WORKSPACE_1_ID = uuidv4();
  const WORKSPACE_2_ID = uuidv4();

  await models.Workspace.create({
    id: WORKSPACE_1_ID,
    creatorId: "asdf",
    totalBudget: 90,
    isPublic: true,
  }, {
    questionValue: generateQuestionValueFromString("This is a public question."),
  });

  await models.Workspace.create({
    id: WORKSPACE_2_ID,
    creatorId: "asdf",
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("This is not a public question."),
  });
}
