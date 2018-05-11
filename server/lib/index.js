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

graphQLServer.use(express.static(path.join(__dirname, '/../../client/build')));
graphQLServer.use(cors())

if (!process.env.USING_DOCKER) {
  graphQLServer.use(enforce.HTTPS({ trustProtoHeader: true }));
  graphQLServer.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  });
}



graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../client/build/public/index.html'));
});

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log("Express/GraphQL server now listening.");
  if (process.env.USING_DOCKER) {
    console.log(
      `GraphiQL: http://localhost:${GRAPHQL_PORT}/graphiql \nReact: http://localhost:${GRAPHQL_PORT}`);
  }
});
