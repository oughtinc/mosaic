import { Workspace } from "../models";
import { RootParentFinder } from "./RootParentFinder";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

const TWO_SECONDS = 2 * 1000;

const scheduler = new Scheduler({
  fetchAllWorkspaces: () => Workspace.findAll(), // WRITE NOTE ON THIS
  schedule: new Schedule({ rootParentFinder: RootParentFinder, timeLimit: TWO_SECONDS }),
  rootParentFinder: RootParentFinder,
});

export { scheduler };
