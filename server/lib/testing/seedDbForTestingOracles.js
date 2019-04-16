const uuidv4 = require("uuid/v4");
import { ID_OF_TYPICAL_USER_FOR_TESTING } from "./constants";
import { generateQuestionValueFromString } from "./utils/generateQuestionValueFromString";
import * as models from "../models";
import { isInOracleMode } from "../globals/isInOracleMode";

const valueOfBlockWithNestedPointers = [
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
            text: " ",
            marks: []
          }
        ]
      },
      {
        object: "inline",
        type: "pointerExport",
        isVoid: false,
        data: {
          pointerId: "9fc2f1c0-14ff-11e9-8207-cb6ce038c9dc"
        },
        nodes: [
          {
            object: "text",
            leaves: [
              {
                object: "leaf",
                text: " unnested  ",
                marks: []
              }
            ]
          },
          {
            object: "inline",
            type: "pointerExport",
            isVoid: false,
            data: {
              pointerId: "9fa5a5c0-14ff-11e9-8207-cb6ce038c9dc"
            },
            nodes: [
              {
                object: "text",
                leaves: [
                  {
                    object: "leaf",
                    text: " nested ",
                    marks: []
                  }
                ]
              }
            ]
          },
          {
            object: "text",
            leaves: [
              {
                object: "leaf",
                text: "  ",
                marks: []
              }
            ]
          }
        ]
      },
      {
        object: "text",
        leaves: [
          {
            object: "leaf",
            text: " ",
            marks: []
          }
        ]
      }
    ]
  }
];

const valueOfQuestionBlockForA2 = [
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
            text: "A-2: A subquestion #2 (1 descendants) - oracle eligible ",
            marks: []
          }
        ]
      },
      {
        object: "inline",
        type: "pointerImport",
        isVoid: true,
        data: {
          pointerId: "9fc2f1c0-14ff-11e9-8207-cb6ce038c9dc",
          internalReferenceId: "a3a2f5a0-1500-11e9-88ea-2d0657d4242d"
        },
        nodes: [
          {
            object: "text",
            leaves: [
              {
                object: "leaf",
                text: " ",
                marks: []
              }
            ]
          }
        ]
      },
      {
        object: "text",
        leaves: [
          {
            object: "leaf",
            text: "",
            marks: []
          }
        ]
      }
    ]
  }
];

export async function seedDbForTestingOracles() {
  isInOracleMode.setValue(true);

  const savedWorkspaceIds = {};

  const A = await models.Workspace.create(
    {
      id: (savedWorkspaceIds["A"] = uuidv4()),
      creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
      totalBudget: 90,
      hasTimeBudget: false,
      hasIOConstraints: true,
      isEligibleForAssignment: true,
      isEligibleForHonestOracle: true,
      isPublic: true
    },
    {
      questionValue: generateQuestionValueFromString(
        "A: Root-level (3 descendants) - oracle eligible"
      )
    }
  );

  const ABlock = await A.getBlocks();

  const AScratchpadBlock = ABlock.find(b => b.type === "SCRATCHPAD");

  await AScratchpadBlock.update({ value: valueOfBlockWithNestedPointers });

  const A1 = await A.createChild({
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-1: A subquestion #1 (0 descendants)"
    )
  });

  const A2 = await A.createChild({
    id: "d1189739-0f53-4c3d-acd7-15aa1543619c",
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-2: A subquestion #2 (1 descendants) - oracle eligible"
    )
  });

  const A2Block = await A2.getBlocks();

  const A2QuestionBlock = A2Block.find(b => b.type === "QUESTION");

  await A2QuestionBlock.update({ value: valueOfQuestionBlockForA2 });

  await A2.update({
    isEligibleForHonestOracle: true
  });

  const A2$1 = await A2.createChild({
    creatorId: ID_OF_TYPICAL_USER_FOR_TESTING,
    totalBudget: 0,
    question: generateQuestionValueFromString(
      "A-2-1: A-2 subquestion #1 (0 descendants)"
    )
  });
}
