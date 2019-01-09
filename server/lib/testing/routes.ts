import * as express from "express";
import { resetDbForTesting } from "./resetDbForTesting";
import { seedDbForTesting } from "./seedDbForTesting";
import { seedDbForTestingIOConstraintsScheduling } from "./seedDbForTestingIOConstraintsScheduling";

const testingRoutes = express.Router();

testingRoutes.post("/__resetDb", async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Resetting DB");
    await resetDbForTesting();
  }
  res.end();
});

testingRoutes.post("/__seedDb", async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Seeding DB");
    await seedDbForTesting();
  }
  res.end();
});

testingRoutes.post("/__seedDbForIOConstraintsScheduling", async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Seeding DB For IO Constraints Scheduling");
    await seedDbForTestingIOConstraintsScheduling();
  }
  res.end();
});

export { testingRoutes };
