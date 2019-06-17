import { isUserAdmin } from "./isUserAdmin";
import { userFromContext } from "./userFromContext";

// Note that requireUser, requireAdmin, and requireOracle all add the user
// object (if there is one) to the GraphQL context, allowing the schema's
// resolvers easy access

export const requireUser = (errMsg, resolver) => async (
  obj,
  args,
  ctx,
  info,
) => {
  console.log(`
            
            
        Start of resolver: ${Date.now()}
        
        
        `);
  const user = await userFromContext(ctx);

  if (!user) {
    throw new Error(`No user found: ${errMsg}`);
  } else {
    return await resolver(obj, args, { ...ctx, user }, info);
  }
};

export const requireAdmin = (errMsg, resolver) => async (
  obj,
  args,
  ctx,
  info,
) => {
  const user = await userFromContext(ctx);

  if (!user) {
    throw new Error(`No user found: ${errMsg}`);
  } else if (!isUserAdmin(user)) {
    throw new Error(`User not admin: ${errMsg}`);
  } else {
    return await resolver(obj, args, { ...ctx, user }, info);
  }
};
