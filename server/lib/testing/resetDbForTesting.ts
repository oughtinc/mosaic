import * as db from "../models";
import { scheduler } from "../scheduler";
import { isInOracleMode } from "../globals/isInOracleMode";

export async function resetDbForTesting() {
  scheduler.reset();

  isInOracleMode.setValue(false);

  if (db && db.sequelize) {
    await db.sequelize.sync({ force: true });
  }
}
