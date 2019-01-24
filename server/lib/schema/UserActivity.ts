import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from "graphql";

import {
  workspaceType
} from "./index";

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
            totalUsersWhoHaveWorkedOnWorkspace: {
              type: GraphQLInt,
            },
            workspace: {
              type: workspaceType
            },
          },
        }
        )
      ),
      resolve: function (userActivity) {
        return userActivity;
      }
    },
  }
})