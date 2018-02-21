import 'babel-polyfill';

import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import {schema} from './schema/index';
var cors = require('cors');

const GRAPHQL_PORT = process.env.PORT || 8080;

const graphQLServer = express();
graphQLServer.use(cors())

graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
));
