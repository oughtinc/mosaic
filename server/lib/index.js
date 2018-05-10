import 'babel-polyfill';

import * as express from 'express';
import * as path from 'path';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
var cors = require('cors');

import { schema } from './schema/index';

const GRAPHQL_PORT = process.env.PORT || 8080;

const graphQLServer = express();

graphQLServer.use(express.static(path.join(__dirname, '/../../client/build')));
graphQLServer.use(cors())

graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../client/build/public/index.html'));
});

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql. \nReact is now running on http://localhost:${GRAPHQL_PORT}`
));
