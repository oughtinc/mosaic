import "babel-polyfill";

import * as express from "express";
import * as enforce from "express-sslify";

import { print } from "graphql";
import gql from "graphql-tag";

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
const cors = require("cors");

const GRAPHQL_PORT = process.env.PORT || 8080;

(async function() {
  const app = express();
  app.use(cors());
  await initializeDb();

  // must wait until DB models have loaded before importing schema
  const { schema } = require("./schema");

  const server = new ApolloServer(
    process.env.APOLLO_ENGINE_API_KEY
      ? {
          schema,
          context: ({ req }) => {
            return {
              authorization: req && req.headers && req.headers.authorization,
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
              authorization: req && req.headers && req.headers.authorization,
            };
          },
        },
  );

  app.get("/experimentActivity", async (req, res) => {
    const jsonResponse = await server.executeOperation({
      query: print(gql`
        query assignments {
          assignments {
            id
            createdAt
            startAtTimestamp
            endAtTimestamp
            user {
              id
              email
            }
            workspace {
              id
              serialId
              rootWorkspace {
                id
                serialId
              }
              isEligibleForHonestOracle
              isEligibleForMaliciousOracle
            }
            experimentId
            experiment {
              id
            }
          }
        }
      `),
    });
    const data =
      jsonResponse && jsonResponse.data && jsonResponse.data.assignments;

    data &&
      data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    res.json(
      data &&
        data.map(assignment => ({
          userEmail: assignment.user.email,
          duration: assignment.endAtTimestamp - assignment.startAtTimestamp,
          workspaceType: assignment.workspace.isEligibleForHonestOracle
            ? "HONEST"
            : assignment.workspace.isEligibleForMaliciousOracle
            ? "MALICIOUS"
            : "JUDGE",
          linkToHistory: `https://mosaic.ought.org/snapshots/${
            assignment.workspace.serialId
          }`,
          linkToTree: `https://mosaic.ought.org/compactTree/${
            assignment.workspace.rootWorkspace.serialId
          }/expanded=true&activeWorkspace=${assignment.workspace.id}`,
        })),
    );
  });

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

    setInterval(sendPendingNotifications, 1000 * 60 * 60 * 2);
  });
})();
