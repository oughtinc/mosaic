import db from "../models";
import { scheduler } from "../scheduler";
import { isInOracleMode } from "../globals/isInOracleMode";

export async function resetDbForTesting() {
  scheduler.reset();

  isInOracleMode.setValue(false);

  await db.sync({ force: true });
}
