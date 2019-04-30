import { authResultsCache } from "./authResultsCache";
import { fetchAuthResultsFrom3rdParty } from "./fetchAuthResultsFrom3rdParty";
import { getLoginCredentialsForAdminAndOracle } from "./getLoginCredentialsForAdminAndOracle";

const ADMIN_AND_ORACLE = "ADMIN_AND_ORACLE";

export async function getAuthResultsForAdminAndOracle() {
  if (authResultsCache.hasValidCache(ADMIN_AND_ORACLE)) {
    return authResultsCache.getCache(ADMIN_AND_ORACLE);
  } else {
    const loginCredentials = getLoginCredentialsForAdminAndOracle();
    const authResults = await fetchAuthResultsFrom3rdParty(loginCredentials);
    authResultsCache.setCache(ADMIN_AND_ORACLE, authResults);
    return authResults;
  }
}
