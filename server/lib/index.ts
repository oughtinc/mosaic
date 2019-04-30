import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import * as path from "path";
import { ApolloServer } from "apollo-server-express";

import { initializeDb } from "./models";
import { testingRoutes } from "./testing/routes";
import sendPendingNotifications from "./notifiers";

const GRAPHQL_PORT = process.env.PORT || 8080;

(async function() {
  const app = express();
  await initializeDb();

  // must wait until DB models have loaded before importing schema
  const { schema } = require("./schema");

  const server = new ApolloServer(
    process.env.APOLLO_ENGINE_API_KEY
      ? {
          schema,
          context: ({ req }) => {
            return {
              authorization: req.headers.authorization,
            };
          },
          engine: {
            apiKey: process.env.APOLLO_ENGINE_API_KEY,
          },
        }
      : {
          schema,
          context: ({ req }) => {
            return {
              authorization: req.headers.authorization,
            };
          },
        },
  );

  if (!process.env.USING_DOCKER) {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
    app.use(express.static(path.join(__dirname, "/../../client/build")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname + "/../../client/build/index.html"));
    });
  }

  server.applyMiddleware({ app });

  app.use("/testing", testingRoutes);

  app.listen(GRAPHQL_PORT, () => {
    if (process.env.USING_DOCKER) {
      console.log(
        `GraphQL playground: http://localhost:${GRAPHQL_PORT}/graphql \nReact: http://localhost:3000`,
      );
    }
    console.log(
      "Express/GraphQL server now listening. React server (web_1) may still be loading.",
    );

    setInterval(sendPendingNotifications, 10000);
  });
})();
