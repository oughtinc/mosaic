import { parse as parseQueryString } from "query-string";

export function getActiveWorkspaceIsFromQueryParams(
  windowLocationSearch: string,
) {
  const queryParams = parseQueryString(windowLocationSearch);

  const activeWorkspaceId = queryParams.activeWorkspace;

  return activeWorkspaceId;
}
