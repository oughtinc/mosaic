import * as _ from "lodash";

export function saveAuthResultsToLocalStorage(authResults) {
  const authResultsWithNoNullOfUndefinedValues = _.omitBy(authResults, _.isNil);

  for (const property in authResultsWithNoNullOfUndefinedValues) {
    localStorage.setItem(
      property,
      authResultsWithNoNullOfUndefinedValues[property],
    );
  }
}
