"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = undefined;

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _graphqlSequelize = require("graphql-sequelize");

var _index = require("../models/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Query = {};

var Mutation = {};

var resolvers = { Query: Query, Mutation: Mutation };

exports.resolvers = resolvers;