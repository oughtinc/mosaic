import { getCommonLoginCredentials } from "./getCommonLoginCredentials";

export function getLoginCredentialsForTypicalUser() {
  const commonLoginCredentials = getCommonLoginCredentials();

  return {
    ...commonLoginCredentials,
    username: Cypress.env("auth0TypicalUserUsername"),
    password: Cypress.env("auth0TypicalUserPassword"),
  };
}
