import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import * as path from "path";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import * as bodyParser from "body-parser";
import * as cors from "cors";

import { schema } from "./schema/index";
import { resetDbForTesting } from "./testing/resetDbForTesting";
import { seedDbForTesting } from "./testing/seedDbForTesting";

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

graphQLServer.use("/graphql", bodyParser.json(), (req, res, next) => {
  return graphqlExpress({
    schema,
    context: {
      authorization: req.headers.authorization,
      user_id: req.headers.user_id
    }
  })(req, res, next);
});

graphQLServer.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

graphQLServer.post("/__resetDb", async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Resetting DB");
    await resetDbForTesting();
  }
  res.end();
});

graphQLServer.post("/__seedDb", async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Seeding DB");
    await seedDbForTesting();
  }
  res.end();
});

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
