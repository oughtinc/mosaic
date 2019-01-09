const uuidv4 = require("uuid/v4");
import {
  ID_OF_TYPICAL_USER_FOR_TESTING,
} from "./constants";
import { generateQuestionValueFromString } from "./utils/generateQuestionValueFromString";
import * as models from "../models";

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
