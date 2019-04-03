import db from "../models";
import { schedulers } from "../scheduler";
import { isInOracleMode } from "../globals/isInOracleMode";

export async function resetDbForTesting() {
  schedulers.forEach((_, scheduler) => {
    scheduler.reset();
  });

  isInOracleMode.setValue(false);

  await db.sync({ force: true });
}
