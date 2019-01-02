import { webAuth } from "./webAuthAppInstance";

export function getUserInfoWithAccessToken(accessToken) {
  return new Promise((resolve, reject) => {
    webAuth.client.userInfo(accessToken, (err, userInfo) => {
      if (err) {
        reject(err);
      }

      resolve(userInfo);
    });
  });
}
