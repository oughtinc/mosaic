import { webAuth } from "./webAuthAppInstance";
import { getAppMetadataWithUserInfo } from "./getAppMetadataWithUserInfo";
import { getUserInfoWithAccessToken } from "./getUserInfoWithAccessToken";

export function fetchAuthResultsFrom3rdParty(loginCredentials) {
  return new Promise((resolve, reject) => {
    webAuth.client.login(loginCredentials, async (err, authResult) => {
      if (err) {
        reject(err);
      }

      let userInfo;
      try {
        userInfo = await getUserInfoWithAccessToken(authResult.accessToken)
      } catch (err) {
        reject(err);
      }

      const appMetadata = getAppMetadataWithUserInfo(userInfo);

      const authResults = {
        access_token: authResult.accessToken,
        expires_at: authResult.expiresIn * 1000 + Date.now(),
        is_admin: appMetadata && appMetadata.is_admin ? true : null,
        is_oracle: appMetadata && appMetadata.is_oracle ? true : null,
        user_id: userInfo.sub,
      };

      resolve(authResults);
    });
  });
}
