import auth0 from "auth0-js";

export const webAuth = new auth0.WebAuth({
  clientID: Cypress.env("auth0ClientId"),
  domain: "mosaicapp.auth0.com",
  responseType: "token id_token",
});
