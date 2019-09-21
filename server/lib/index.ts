import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import * as path from "path";
import { ApolloServer } from "apollo-server-express";

// Adding Sentry needs to occur before importing initializeDb from "./models"
// This is because importing "./models" configures the DB connection
// During this configuration, console.log is specified as the Sequelize logging function
// But initializing Sentry wraps console.log
// So if we initialize Sentry after importing "./models", the Sequelize logging function
// won't equal (the now wrapped) console.log
// If the Sequelize logging function doesn't equal console.log, then Sequelize
// logs the options object with every DB query, which means the logs are much harder to
// read because these many-line options object get spammed with every DB query
if (process.env.SENTRY_DSN) {
  console.log("Starting Sentry");

  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

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

    //setInterval(sendPendingNotifications, 1000 * 60 * 60 * 2);
  });
})();
