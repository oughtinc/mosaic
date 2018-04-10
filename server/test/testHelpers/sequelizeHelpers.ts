import * as models from "../../lib/models";

export const truncate = () => Promise.all(Object.keys(models).map((key) => {
    if (['sequelize', 'Sequelize'].indexOf(key) > -1) {
        return;
    }
    return models[key].destroy({ where: {}, force: true });
}))
    .catch(truncate);
// this recursive catch is here b/c
// sometimes some of the tables don't get truncated on the first pass
// b/c of foreign key constraints.
// I've only ever seen two passes needed,
// and of course this is a test helper that's not used outside of tests,
// so the slight hackiness seems fine to me.