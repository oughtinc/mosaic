const uuidv4 = require("uuid/v4");
import {
  ID_OF_TYPICAL_USER_FOR_TESTING,
} from "./constants";
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
  await models.Workspace.create({
    id: uuidv4(),
    creatorId: "asdf",
    totalBudget: 90,
    isPublic: true,
  }, {
    questionValue: generateQuestionValueFromString("This is a public question."),
  });

  await models.Workspace.create({
    id: uuidv4(),
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("This is not public, but created by 'typical user'."),
  });

  await models.Workspace.create({
    id: uuidv4(),
    creatorId: "asdf",
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("This is not a public question."),
  });
}
