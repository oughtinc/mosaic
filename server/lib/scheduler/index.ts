import { Workspace } from "../models";
import { RootParentCache } from "./RootParentCache";
import { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

const ONE_MINUTE = 60 * 1000;

//  By separating out fetchAllWorkspaces and rootParentCache, we 100% isolate
//  the rest of the scheduling code (Scheduler, Schedule, UserSchedule, and
//  Assignment classes) from Sequelize & Postgres

const scheduler = new Scheduler({
  fetchAllWorkspaces: () => Workspace.findAll(),
  schedule: new Schedule({ rootParentCache: RootParentCache, timeLimit: ONE_MINUTE }),
  rootParentCache: RootParentCache,
});

export { scheduler };
