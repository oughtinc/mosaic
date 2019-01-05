import { getCommonLoginCredentials } from "./getCommonLoginCredentials";

export function getLoginCredentialsForOracle() {
  const commonLoginCredentials = getCommonLoginCredentials();

  return {
    ...commonLoginCredentials,
    username: Cypress.env("auth0OracleUsername"),
    password: Cypress.env("auth0OraclePassword"),
  };
}
