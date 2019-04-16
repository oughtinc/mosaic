const uuidv4 = require("uuid/v4");
import { ID_OF_TYPICAL_USER_FOR_TESTING } from "./constants";
import { generateQuestionValueFromString } from "./utils/generateQuestionValueFromString";
import * as models from "../models";

export async function seedDbForTestingIOConstraintsScheduling() {
  const savedWorkspaceIds = {};

  const A = await models.Workspace.create(
    {
      id: (savedWorkspaceIds["A"] = uuidv4()),
      creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
      totalBudget: 90,
      hasTimeBudget: false,
      hasIOConstraints: true,
      isEligibleForAssignment: true,
      isPublic: true
    },
    {
      questionValue: generateQuestionValueFromString(
        "A: Root-level (3 descendants)"
      )
    }
  );

  const A1 = await A.createChild({
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-1: A subquestion #1 (0 descendants)"
    )
  });

  const A2 = await A.createChild({
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-2: A subquestion #2 (1 descendants)"
    )
  });

  const A2$1 = await A2.createChild({
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-2-1: A-2 subquestion #1 (0 descendants)"
    )
  });
}
