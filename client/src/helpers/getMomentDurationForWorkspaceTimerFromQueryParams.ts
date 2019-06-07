import { parse as parseQueryString } from "query-string";

export function getMomentDurationForWorkspaceTimerFromQueryParams(
  windowLocationSearch,
) {
  const queryParams = parseQueryString(windowLocationSearch);

  return queryParams.timer;
}
