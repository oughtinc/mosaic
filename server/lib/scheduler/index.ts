import { Workspace } from "../models";
import { RootParentFinder } from "./RootParentFinder";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

const ONE_MINUTE = 60 * 1000;

const scheduler = new Scheduler({
  fetchAllWorkspaces: () => Workspace.findAll(), // WRITE NOTE ON THIS
  schedule: new Schedule({ rootParentFinder: RootParentFinder, timeLimit: ONE_MINUTE }),
  rootParentFinder: RootParentFinder,
});

export { scheduler };
