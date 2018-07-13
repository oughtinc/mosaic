import * as models from "../../lib/models";
import * as _ from "lodash";
import * as Promise from "bluebird";

// sequelize and Sequelize are in here b/c they're not actually tables.
// Event is in here b/c clearing the events table
// creates all sorts of weird foreign key problems, and isn't necessary,
// at least for our current tests.
const keysToExclude = ["sequelize", "Sequelize", "Event"];

const modelNamesToTruncate = _.pull(Object.keys(models), ...keysToExclude);

export const truncateDb = () =>
  Promise.each(modelNamesToTruncate, modelName =>
    models[modelName].destroy({ where: {}, force: true })
  );
