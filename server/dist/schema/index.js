'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = undefined;

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _graphqlSequelize = require('graphql-sequelize');

var _graphql = require('graphql');

var _async = require('async');

var aasync = _interopRequireWildcard(_async);

var _pluralize = require('pluralize');

var pluralize = _interopRequireWildcard(_pluralize);

var _Case = require('Case');

var Case = _interopRequireWildcard(_Case);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var models = require('../models');


var generateReferences = function generateReferences(model, references) {
  var all = {};
  references.map(function (r) {
    all[r[0]] = {
      type: r[1](),
      resolve: (0, _graphqlSequelize.resolver)(model[r[2]])
    };
  });
  return all;
};

var makeObjectType = function makeObjectType(model, references) {
  return new _graphql.GraphQLObjectType({
    name: model.name,
    description: model.name,
    fields: function fields() {
      return _.assign((0, _graphqlSequelize.attributeFields)(model), generateReferences(model, references));
    }
  });
};

var blockType = makeObjectType(models.Block, [['blockVersions', function () {
  return blockVersionType;
}, 'BlockVersions']]);

var blockVersionType = makeObjectType(models.BlockVersion, []);

var workspaceType = makeObjectType(models.Workspace, [['questionBlock', function () {
  return blockType;
}, 'QuestionBlock'], ['answerBlock', function () {
  return blockType;
}, 'AnswerBlock'], ['scratchpadBlock', function () {
  return blockType;
}, 'ScratchpadBlock'], ['workspaceVersions', function () {
  return new _graphql.GraphQLList(workspaceVersionType);
}, 'WorkspaceVersions']]);

var workspaceVersionType = makeObjectType(models.WorkspaceVersion, [['questionBlockVersion', function () {
  return blockVersionType;
}, 'QuestionBlockVersion'], ['answerBlockVersion', function () {
  return blockVersionType;
}, 'AnswerBlockVersion'], ['scratchpadBlockVersion', function () {
  return blockVersionType;
}, 'ScratchpadBlockVersion']]);
// {workspaceId: {type: GraphQLString}, ..._.pick(attributeFields(models.BlockVersion), ['blockId', 'value'])},
var BlockInput = new _graphql.GraphQLInputObjectType({
  name: "blockVersionInput",
  fields: _.pick((0, _graphqlSequelize.attributeFields)(models.BlockVersion), 'value', 'blockId')
});

var schema = new _graphql.GraphQLSchema({
  query: new _graphql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      workspaces: {
        type: new _graphql.GraphQLList(workspaceType),
        resolve: (0, _graphqlSequelize.resolver)(models.Workspace)
      }
    }
  }),
  mutation: new _graphql.GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      updateBlockVersions: {
        type: blockVersionType,
        args: { workspaceId: { type: _graphql.GraphQLString }, blockVersions: { type: new _graphql.GraphQLList(BlockInput) } },
        resolve: function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(a, _ref2) {
            var workspaceId = _ref2.workspaceId,
                blockVersions = _ref2.blockVersions;
            var workspace, recent;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return models.Workspace.findById(workspaceId);

                  case 2:
                    workspace = _context.sent;
                    _context.next = 5;
                    return workspace.recentWorkspaceVersion();

                  case 5:
                    recent = _context.sent;
                    _context.next = 8;
                    return workspace.updateBlockVersions(blockVersions);

                  case 8:
                    return _context.abrupt('return', { value: "sdafasdf" });

                  case 9:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, undefined);
          }));

          return function resolve(_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }()
      }
    }
  })
});

exports.schema = schema;