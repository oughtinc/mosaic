import { AuthenticationClient } from "auth0";

const { auth0_client_id } = require("../../../config/config.json");

const authClient = new AuthenticationClient({
  domain: "mosaicapp.auth0.com",
  clientId: auth0_client_id,
});

interface UserInfo {
  user_id: string;
  email: string;
  given_name: string;
  family_name: string;
  gender: string;
  picture: string;
  is_admin: boolean;
  is_oracle: boolean;
}

export function userFromAuthToken(accessToken: string | null): Promise<UserInfo | null> {
  if (accessToken == null || accessToken === "null") {
    return Promise.resolve(null);
  }

  // first check cache and return cached value if it's younger than 10 seconds
  const cachedToken = userFromAuthToken.cache[accessToken];
  if (cachedToken) {
    const nowTimestamp = Date.now();
    const cacheTimestamp = cachedToken.timestamp;
    const SIXTY_SECONDS = 60000;
    if (nowTimestamp - cacheTimestamp < SIXTY_SECONDS) {
      return Promise.resolve(cachedToken.data);
    }
  }

  return new Promise(resolve => {
    authClient.getProfile(accessToken, function(err: any, user: any) {
      if (err != null) {
        console.log("UserInfo error:", err);
        return resolve(null);
      }
      const metadataKey = "https://mosaic:auth0:com/app_metadata";
      const isAdmin = user[metadataKey] ? user[metadataKey].is_admin : false;
      const isOracle = user[metadataKey] ? user[metadataKey].is_oracle : false;

      const data = {
        user_id: user.sub,
        email: user.email,
        given_name: user.given_name,
        family_name: user.family_name,
        gender: user.gender,
        picture: user.picture,
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
