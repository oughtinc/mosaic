import User from "../../models/user";
import { authTokenFromContext } from "./authTokenFromContext";
import { userFromAuthToken } from "./userFromAuthToken";

export async function userFromContext(ctx) {
  const authToken = authTokenFromContext(ctx);
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

    return user;
  } else {
    return null;
  }
}
