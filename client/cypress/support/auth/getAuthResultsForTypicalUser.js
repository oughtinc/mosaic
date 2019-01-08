import { authResultsCache } from "./authResultsCache";
import { fetchAuthResultsFrom3rdParty } from "./fetchAuthResultsFrom3rdParty";
import { getLoginCredentialsForTypicalUser } from "./getLoginCredentialsForTypicalUser";

const TYPICAL_USER = "TYPICAL_USER";

export async function getAuthResultsForTypicalUser(){
  if (authResultsCache.hasValidCache(TYPICAL_USER)) {
    return authResultsCache.getCache(TYPICAL_USER);
  } else {
    const loginCredentials = getLoginCredentialsForTypicalUser();
    const authResults = await fetchAuthResultsFrom3rdParty(loginCredentials);
    authResultsCache.setCache(TYPICAL_USER, authResults);
    return authResults;
  }
}
