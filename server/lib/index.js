import 'babel-polyfill';

import * as express from 'express';
import * as enforce from 'express-sslify';

import * as path from 'path';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
var cors = require('cors');

import { schema } from './schema/index';

const GRAPHQL_PORT = process.env.PORT || 8080;

const graphQLServer = express();

graphQLServer.use(cors())

if (!process.env.USING_DOCKER) {
  graphQLServer.use(enforce.HTTPS({ trustProtoHeader: true }));
  graphQLServer.use(express.static(path.join(__dirname, '/../../client/build')));
  graphQLServer.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
  });
}

graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log("Express/GraphQL server now listening. React server (web) may still be loading.");
  if (process.env.USING_DOCKER) {
    console.log(
      `GraphiQL: http://localhost:${GRAPHQL_PORT}/graphiql \nReact: http://localhost:3000`);
  }
});
