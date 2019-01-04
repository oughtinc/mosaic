import * as db from "../models";

export async function resetDbForTesting() {
  if (db && db.sequelize) {
    await db.sequelize.sync({ force: true });
  }
}
