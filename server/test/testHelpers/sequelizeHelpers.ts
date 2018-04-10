import * as models from "../../lib/models";

// sequelize is in here b/c it's not actually one of our tables.
// Event is in here b/c clearing the events table
// creates all sorts of weird foreign key problems, and isn't necessary,
// at least for our current tests.
const keysToExclude = ['sequelize', 'Sequelize', 'Event'];

export const truncate = () => Promise.all(Object.keys(models).map((key) => {
    if (keysToExclude.indexOf(key) > -1) {
        return;
    }
    return models[key].destroy({ where: {}, force: true });
}))