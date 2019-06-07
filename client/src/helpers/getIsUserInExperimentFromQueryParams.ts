import { parse as parseQueryString } from "query-string";

export function getIsUserInExperimentFromQueryParams(
  windowLocationSearch: string,
) {
  const queryParams = parseQueryString(windowLocationSearch);

  const isThereLongExperimentQueryParam = !!queryParams.experiment;
  const isThereShortExperimentQueryParam = !!queryParams.e;

  return isThereLongExperimentQueryParam || isThereShortExperimentQueryParam;
}
