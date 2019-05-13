import User from "../../models/user";
import { authTokenFromContext } from "./authTokenFromContext";
import { userIdFromContext } from "./userIdFromContext";
import { userFromAuthToken } from "./userFromAuthToken";

const cache = {};

export async function userFromContext(ctx) {
  const userId = userIdFromContext(ctx);
  const authToken = authTokenFromContext(ctx);

  if (cache[userId] && cache[userId] === authToken) {
    let user = await User.findByPk(userId);
    if (!user) {
      const userInfo = await userFromAuthToken(authToken);
      if (userInfo !== null) {
        user = await User.create({
          id: userInfo.user_id,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          gender: userInfo.gender,
          pictureURL: userInfo.picture,
          isAdmin: userInfo.is_admin,
        });
      }
    }
    return user;
  } else {
    const userInfo = await userFromAuthToken(authToken);

    if (userInfo !== null && userInfo.user_id) {
      let user = await User.findByPk(userInfo.user_id);

      if (!user) {
        user = await User.create({
          id: userInfo.user_id,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          gender: userInfo.gender,
          pictureURL: userInfo.picture,
          isAdmin: userInfo.is_admin,
        });
      } else if (
        (!user.givenName && userInfo.given_name) ||
        (!user.email && userInfo.email) ||
        user.isAdmin !== userInfo.is_admin
      ) {
        await user.update({
          id: userInfo.user_id,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          gender: userInfo.gender,
          pictureURL: userInfo.picture,
          isAdmin: userInfo.is_admin,
        });
      }

      // successfully extracted user so don't repeat this process with this auth token
      cache[userId] = authToken;

      return user;
    } else {
      // did NOT successfully extracted user
      // so don't cache anyhting

      return null;
    }
  }
}
