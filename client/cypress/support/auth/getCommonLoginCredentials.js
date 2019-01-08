export function getCommonLoginCredentials() {
  return {
    audience: "https://mosaicapp.auth0.com/api/v2/",
    realm: "Username-Password-Authentication",
    scope: "openid email profile",
  };
}
