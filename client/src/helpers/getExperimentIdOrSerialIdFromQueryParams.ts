import { parse as parseQueryString } from "query-string";

export function getExperimentIdOrSerialIdFromQueryParams(windowLocationSearch) {
  const queryParams = parseQueryString(windowLocationSearch);

  return queryParams.experiment || queryParams.e;
}
