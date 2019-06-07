import { parse as parseQueryString } from "query-string";

export function getDoesWorkspaceHaveTimerFromQueryParams(
  windowLocationSearch: string,
) {
  const queryParams = parseQueryString(windowLocationSearch);

  const doesWorkspaceHaveTimer = queryParams.timer;

  return doesWorkspaceHaveTimer;
}
