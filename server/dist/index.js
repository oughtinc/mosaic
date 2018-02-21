'use strict';

require('babel-polyfill');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _apolloServerExpress = require('apollo-server-express');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _index = require('./schema/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cors = require('cors');

var GRAPHQL_PORT = process.env.PORT || 8080;

var graphQLServer = (0, _express2.default)();
graphQLServer.use(cors());

graphQLServer.use('/graphql', _bodyParser2.default.json(), (0, _apolloServerExpress.graphqlExpress)({ schema: _index.schema }));
graphQLServer.use('/graphiql', (0, _apolloServerExpress.graphiqlExpress)({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT, function () {
  return console.log('GraphiQL is now running on http://localhost:' + GRAPHQL_PORT + '/graphiql');
});