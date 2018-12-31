import { authTokenFromContext } from "./authTokenFromContext";
import { userFromAuthToken } from "./userFromAuthToken";

export async function userFromContext(ctx) {
  const authToken = authTokenFromContext(ctx);
  return await userFromAuthToken(authToken);
}
