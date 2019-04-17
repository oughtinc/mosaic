import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import * as path from "path";
import { ApolloServer } from "apollo-server-express";

import db from "./models";
import { userFromAuthToken } from "./schema/auth/userFromAuthToken";
import { schema } from "./schema";
import { testingRoutes } from "./testing/routes";

const GRAPHQL_PORT = process.env.PORT || 8080;

const app = express();
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const userInfo = await userFromAuthToken(req.headers.authorization);
    if (userInfo !== null) {
      let user = await db.models.User.findByPk(userInfo.user_id);

      if (!user) {
        user = await db.models.User.create({
          id: userInfo.user_id,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          gender: userInfo.gender,
          pictureURL: userInfo.picture,
        });
      } else if (
        (!user.givenName && userInfo.given_name)
        ||
        (!user.email && userInfo.email)
      ) {
        await user.update({
          id: userInfo.user_id,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          gender: userInfo.gender,
          pictureURL: userInfo.picture,
        });
      }

      return {
        authorization: req.headers.authorization,
        user,
      };
    } else {
      return {
        authorization: null,
      };
    }
  },
});

if (!process.env.USING_DOCKER) {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  app.use(
    express.static(path.join(__dirname, "/../../client/build"))
  );
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../../client/build/index.html"));
  });
}

server.applyMiddleware({ app });

app.use("/testing", testingRoutes);

app.listen(GRAPHQL_PORT, () => {
  if (process.env.USING_DOCKER) {
    console.log(
      `GraphQL playground: http://localhost:${GRAPHQL_PORT}/graphql \nReact: http://localhost:3000`
    );
  }
  console.log(
    "Express/GraphQL server now listening. React server (web_1) may still be loading."
  );
});
