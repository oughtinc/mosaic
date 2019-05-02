import { map } from "asyncro";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

import Workspace from "../models/workspace";
import { workspaceType } from "./index";

export const UserActivityType = new GraphQLObjectType({
  name: "UserActivity",
  fields: {
    assignments: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "Assignment",
          fields: {
            howLongDidAssignmentLast: {
              type: GraphQLInt,
            },
            startAtTimestamp: {
              type: GraphQLString,
            },
            totalUsersWhoHaveWorkedOnWorkspace: {
              type: GraphQLInt,
            },
            workspace: {
              type: workspaceType,
            },
          },
        }),
      ),
      resolve: async function(userActivity) {
        return await map(userActivity, async a => {
          const workspace = await Workspace.findByPk(a.workspace.id);
          return {
            ...a,
            workspace,
          };
        });
      },
    },
  },
});
