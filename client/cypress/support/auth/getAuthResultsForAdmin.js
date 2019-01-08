import { authResultsCache } from "./authResultsCache";
import { fetchAuthResultsFrom3rdParty } from "./fetchAuthResultsFrom3rdParty";
import { getLoginCredentialsForAdmin } from "./getLoginCredentialsForAdmin";

const ADMIN = "ADMIN";

export async function getAuthResultsForAdmin(){
  if (authResultsCache.hasValidCache(ADMIN)) {
    return authResultsCache.getCache(ADMIN);
  } else {
    const loginCredentials = getLoginCredentialsForAdmin();
    const authResults = await fetchAuthResultsFrom3rdParty(loginCredentials);
    authResultsCache.setCache(ADMIN, authResults);
    return authResults;
  }
}
