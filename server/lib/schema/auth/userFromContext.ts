const bcrypt = require("bcryptjs");
import * as _ from "lodash";
import User from "../../models/user";
import { authTokenFromContext } from "./authTokenFromContext";
import { userIdFromContext } from "./userIdFromContext";
import { userFromAuthToken } from "./userFromAuthToken";
const { fork } = require("child_process");
const path = require("path");

const cache = new Map();

export async function userFromContext(ctx) {
  const userId = userIdFromContext(ctx);

  for (let i = 0; i < 5; i++) {
    const compute = fork(path.resolve(__dirname, "./compute.js"));
    compute.send("start");

    compute.on("message", result => {
      console.log(`Long computation result: ${result}`);
      compute.send("stop");
    });
  }

  await Promise.all(users);

  // if (cache.has(userId)) {
  //   const cachedUserObject = cache.get(userId);
  //   if (Date.now() - cachedUserObject.timestamp < 1000 * 60 * 5) {
  //     return cachedUserObject.user;
  //   }
  // }

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
      cache.set(userId, { timestamp: Date.now(), user });
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

        cache.set(userId, { timestamp: Date.now(), user });
        return user;
      } else {
        return null;
      }
    }
  }
}
