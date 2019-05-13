export function authTokenFromContext(ctx) {
  return ctx.authorization.split("::")[0];
}
