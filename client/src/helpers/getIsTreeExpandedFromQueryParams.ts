import { parse as parseQueryString } from "query-string";

export function getIsTreeExpandedFromQueryParams(windowLocationSearch) {
  const queryParams = parseQueryString(windowLocationSearch);

  const isTreeExpanded = queryParams.expanded === "true";

  return isTreeExpanded;
}
