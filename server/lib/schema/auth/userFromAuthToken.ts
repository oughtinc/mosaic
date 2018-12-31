import * as auth0 from "auth0-js";

const { auth0_client_id } = require("../../../config/config.json");

const webAuth = new auth0.WebAuth({
  domain: "mosaicapp.auth0.com",
  clientID: auth0_client_id,
  scope: "openid user_metadata app_metadata"
});

export function userFromAuthToken(accessToken: string | null): Promise<any | null> {
  if (accessToken == null || accessToken === "null") {
    return Promise.resolve(null);
  }

  // first check cache and return cached value if it's younger than 10 seconds
  const cachedToken = userFromAuthToken.cache[accessToken];
  if (cachedToken) {
    const nowTimestamp = Date.now();
    const cacheTimestamp = cachedToken.timestamp;
    const TEN_SECONDS = 10000;
    if (nowTimestamp - cacheTimestamp < TEN_SECONDS) {
      return Promise.resolve(cachedToken.data);
    }
  }

  return new Promise(resolve => {
    webAuth.client.userInfo(accessToken, function(err: any, user: any) {
      if (err != null) {
        console.log("UserInfo error:", err);
        return resolve(null);
      }
      const metadataKey = "https://mosaic:auth0:com/app_metadata";
      const isAdmin = user[metadataKey] ? user[metadataKey].is_admin : false;
      const isOracle = user[metadataKey] ? user[metadataKey].is_oracle : false;

      const data = {
        user_id: user.sub,
        is_admin: isAdmin,
        is_oracle: isOracle,
       };

      // update cache
      userFromAuthToken.cache[accessToken] = {
        data,
        timestamp: Date.now()
      };

      return resolve(data);
    });
  });
}

userFromAuthToken.cache = {};
