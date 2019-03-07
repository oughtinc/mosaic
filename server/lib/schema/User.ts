import {
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

  export const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
      id: {
        type: GraphQLString,
        resolve: user => user.id,
      },
      familyName: {
        type: GraphQLString,
        resolve: user => user.familyName,
      },
      givenName: {
        type: GraphQLString,
        resolve: user => user.givenName,
      },
      email: {
        type: GraphQLString,
        resolve: user => user.email,
      }
    }
  })