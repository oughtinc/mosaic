import { authResultsCache } from "./authResultsCache";
import { fetchAuthResultsFrom3rdParty } from "./fetchAuthResultsFrom3rdParty";
import { getLoginCredentialsForOracle } from "./getLoginCredentialsForOracle";

const ORACLE = "ORACLE";

export async function getAuthResultsForOracle() {
  if (authResultsCache.hasValidCache(ORACLE)) {
    return authResultsCache.getCache(ORACLE);
  } else {
    const loginCredentials = getLoginCredentialsForOracle();
    const authResults = await fetchAuthResultsFrom3rdParty(loginCredentials);
    authResultsCache.setCache(ORACLE, authResults);
    return authResults;
  }
}
