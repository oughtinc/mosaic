import { getCommonLoginCredentials } from "./getCommonLoginCredentials";

export function getLoginCredentialsForAdmin() {
  const commonLoginCredentials = getCommonLoginCredentials();

  return {
    ...commonLoginCredentials,
    username: Cypress.env("auth0AdminUsername"),
    password: Cypress.env("auth0AdminPassword"),
  };
}
