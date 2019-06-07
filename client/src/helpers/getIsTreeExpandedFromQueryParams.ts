import { parse as parseQueryString } from "query-string";

export function getIsTreeExpandedFromQueryParams(windowLocationSearch: string) {
  const queryParams = parseQueryString(windowLocationSearch);

  const isTreeExpanded = queryParams.expanded === "true";

  return isTreeExpanded;
}
