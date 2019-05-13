export function userIdFromContext(ctx) {
  return ctx.authorization.split("::")[1];
}
