const bcrypt = require("bcryptjs");
import * as _ from "lodash";
import User from "../../models/user";
import { authTokenFromContext } from "./authTokenFromContext";
import { userIdFromContext } from "./userIdFromContext";
import { userFromAuthToken } from "./userFromAuthToken";

export async function userFromContext(ctx) {
  const userId = userIdFromContext(ctx);
  const authToken = authTokenFromContext(ctx);
  const saltedHash = await bcrypt.hash(authToken, 10);

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
        accessTokens: [saltedHash],
      });
    }
  } else {
    const accessTokens = user.accessTokens || [];

    const tokensCompared = await Promise.all(
      accessTokens.map(async t => await bcrypt.compare(authToken, t)),
    );

    if (_.some(tokensCompared)) {
      return user;
    } else {
      const userInfo = await userFromAuthToken(authToken);

      if (userInfo !== null && userInfo.user_id) {
        const hasGivenNameBeenAdded = !user.givenName && userInfo.given_name;
        const hasEmailedBeenAdded = !user.email && userInfo.email;
        const hasAdminStatusChanged = user.isAdmin !== userInfo.is_admin;

        const doesUserNeedUpdatingInDB =
          hasGivenNameBeenAdded || hasEmailedBeenAdded || hasAdminStatusChanged;

        if (doesUserNeedUpdatingInDB) {
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

        // add this new access token
        accessTokens.push(saltedHash);
        await user.update({ accessTokens });

        return user;
      } else {
        return null;
      }
    }
  }
}
