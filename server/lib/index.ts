import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import * as path from "path";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import * as bodyParser from "body-parser";
import * as cors from "cors";

import db from "./models";
import { userFromAuthToken } from "./schema/auth/userFromAuthToken";
import { schema } from "./schema";
import { testingRoutes } from "./testing/routes";

const GRAPHQL_PORT = process.env.PORT || 8080;

const graphQLServer = express();

graphQLServer.use(cors());

if (!process.env.USING_DOCKER) {
  graphQLServer.use(enforce.HTTPS({ trustProtoHeader: true }));
  graphQLServer.use(
    express.static(path.join(__dirname, "/../../client/build"))
  );
  graphQLServer.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../../client/build/index.html"));
  });
}

graphQLServer.use("/graphql", bodyParser.json(), async (req, res, next) => {
  if (req.headers.authorization !== "null") {
    const userInfo = await userFromAuthToken(req.headers.authorization);
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

    return graphqlExpress({
      schema,
      context: {
        authorization: req.headers.authorization,
        user,
      }
    })(req, res, next);

  } else {

    return graphqlExpress({
      schema,
      context: {
        authorization: null,
      }
    })(req, res, next);

  }
});

graphQLServer.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

graphQLServer.use("/testing", testingRoutes);

graphQLServer.listen(GRAPHQL_PORT, () => {
  if (process.env.USING_DOCKER) {
    console.log(
      `GraphiQL: http://localhost:${GRAPHQL_PORT}/graphiql \nReact: http://localhost:3000`
    );
  }
  console.log(
    "Express/GraphQL server now listening. React server (web_1) may still be loading."
  );
});
