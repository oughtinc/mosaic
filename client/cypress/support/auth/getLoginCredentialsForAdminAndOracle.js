import { getCommonLoginCredentials } from "./getCommonLoginCredentials";

export function getLoginCredentialsForAdminAndOracle() {
  const commonLoginCredentials = getCommonLoginCredentials();

  return {
    ...commonLoginCredentials,
    username: Cypress.env("auth0AdminAndOracleUsername"),
    password: Cypress.env("auth0AdminAndOraclePassword"),
  };
}
