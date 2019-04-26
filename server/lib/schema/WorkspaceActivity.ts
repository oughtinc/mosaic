import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

import User from "../models/user";

import { userType } from "./index";
import { workspaceType } from "./index";

export const WorkspaceActivityType = new GraphQLObjectType({
  name: "WorkspaceActivitys",
  fields: {
    assignments: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "WorkspaceAssignment",
          fields: {
            endAtTimestamp: {
              type: GraphQLString,
            },
            startAtTimestamp: {
              type: GraphQLString,
            },
            workspace: {
              type: workspaceType,
            },
            user: {
              type: userType,
            },
          },
        }),
      ),
      resolve: async function(workspaceActivity) {
        return workspaceActivity.map(async a => {
          const user = await User.findByPk(a.userId);
          return { ...a, user };
        });
      },
    },
  },
});
