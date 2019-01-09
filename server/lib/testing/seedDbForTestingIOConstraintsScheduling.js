const uuidv4 = require("uuid/v4");
import {
  ID_OF_TYPICAL_USER_FOR_TESTING,
} from "./constants";
import { generateQuestionValueFromString } from "./utils/generateQuestionValueFromString";
import * as models from "../models";

export async function seedDbForTestingIOConstraintsScheduling() {
  const savedWorkspaceIds = {}

  await models.Workspace.create({
    id: savedWorkspaceIds["A"] = uuidv4(),
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 90,
    hasTimeBudget: false,
    hasIOConstraints: true,
    isEligibleForAssignment: true,
    isPublic: true,
  }, {
    questionValue: generateQuestionValueFromString("A: Root-level [3 descendants]"),
  });

  await models.Workspace.create({
    id: uuidv4(),
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    parentId: savedWorkspaceIds["A"],
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("A-1: A subquestion #1 [0 descendants]"),
  });

  await models.Workspace.create({
    id: savedWorkspaceIds["A-2"] = uuidv4(),
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    parentId: savedWorkspaceIds["A"],
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("A-2: A subquestion #2 [1 descendants]"),
  });

  await models.Workspace.create({
    id: uuidv4(),
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    parentId: savedWorkspaceIds["A-2"],
    totalBudget: 90,
  }, {
    questionValue: generateQuestionValueFromString("A-2-1: A-2 subquestion #1 [0 descendants]"),
  });
}
