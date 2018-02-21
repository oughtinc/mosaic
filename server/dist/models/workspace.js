'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Sequelize = require('sequelize');
var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(workspace, options) {
          var question, answer, scratchpad;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return sequelize.models.Block.create();

                case 2:
                  question = _context.sent;
                  _context.next = 5;
                  return sequelize.models.Block.create();

                case 5:
                  answer = _context.sent;
                  _context.next = 8;
                  return sequelize.models.Block.create();

                case 8:
                  scratchpad = _context.sent;

                  workspace.questionId = question.id;
                  workspace.answerId = answer.id;
                  workspace.scratchpadId = scratchpad.id;

                case 12:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined);
        }));

        return function beforeCreate(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }(),
      afterCreate: function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(workspace, options) {
          var question, answer, scratchpad, questionVersion, answerVersion, scratchpadVersion, workspaceVersion;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return workspace.getQuestionBlock();

                case 2:
                  question = _context2.sent;
                  _context2.next = 5;
                  return workspace.getAnswerBlock();

                case 5:
                  answer = _context2.sent;
                  _context2.next = 8;
                  return workspace.getScratchpadBlock();

                case 8:
                  scratchpad = _context2.sent;
                  _context2.next = 11;
                  return sequelize.models.BlockVersion.create({ blockId: question.id, value: {} });

                case 11:
                  questionVersion = _context2.sent;
                  _context2.next = 14;
                  return sequelize.models.BlockVersion.create({ blockId: answer.id, value: {} });

                case 14:
                  answerVersion = _context2.sent;
                  _context2.next = 17;
                  return sequelize.models.BlockVersion.create({ blockId: scratchpad.id, value: {} });

                case 17:
                  scratchpadVersion = _context2.sent;
                  _context2.next = 20;
                  return sequelize.models.WorkspaceVersion.create({
                    workspaceId: workspace.id,
                    questionVersionId: questionVersion.id,
                    answerVersionId: answerVersion.id,
                    scratchpadVersionId: scratchpadVersion.id
                  });

                case 20:
                  workspaceVersion = _context2.sent;

                case 21:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined);
        }));

        return function afterCreate(_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }()
    }
  });
  Workspace.associate = function (models) {
    Workspace.WorkspaceVersions = Workspace.hasMany(models.WorkspaceVersion, { as: 'workspaceVersions', foreignKey: 'workspaceId' });
    Workspace.QuestionBlock = Workspace.belongsTo(models.Block, { as: 'questionBlock', foreignKey: 'questionId' });
    Workspace.AnswerBlock = Workspace.belongsTo(models.Block, { as: 'answerBlock', foreignKey: 'answerId' });
    Workspace.ScratchpadBlock = Workspace.belongsTo(models.Block, { as: 'scratchpadBlock', foreignKey: 'scratchpadId' });
  };
  Workspace.prototype.recentWorkspaceVersion = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var workspaceVersions;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return this.getWorkspaceVersions();

          case 2:
            workspaceVersions = _context3.sent;
            return _context3.abrupt('return', workspaceVersions[0]);

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  Workspace.prototype.createWorkspaceVersion = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(newInputs) {
      var previousWorkspaceVersion, previousValues;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.recentWorkspaceVersion();

            case 2:
              previousWorkspaceVersion = _context4.sent;
              previousValues = _.pick(previousWorkspaceVersion.dataValues, ['questionVersionId', 'answerVersionId', 'scratchpadVersionId']);
              _context4.next = 6;
              return sequelize.models.WorkspaceVersion.create(_extends({}, previousValues, newInputs, { workspaceId: this.id }));

            case 6:
              return _context4.abrupt('return', _context4.sent);

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  }();
  Workspace.prototype.updateBlockVersions = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(blockVersions) {
      var recentWorkspaceVersion, newInputs, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, blockVersionData, blockVersion, _blockVersion, _blockVersion2, newWorkspaceVersion;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.recentWorkspaceVersion();

            case 2:
              recentWorkspaceVersion = _context5.sent;

              if (!false) {
                _context5.next = 5;
                break;
              }

              throw new Error("Multiple BlockVersions for same blockID");

            case 5:
              if (!false) {
                _context5.next = 7;
                break;
              }

              throw new Error("Referenced blockId does not exist on referenced workspace.");

            case 7:
              newInputs = {};
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context5.prev = 11;
              _iterator = blockVersions[Symbol.iterator]();

            case 13:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context5.next = 33;
                break;
              }

              blockVersionData = _step.value;

              if (!(this.questionId === blockVersionData.blockId)) {
                _context5.next = 20;
                break;
              }

              _context5.next = 18;
              return sequelize.models.BlockVersion.create(blockVersionData);

            case 18:
              blockVersion = _context5.sent;

              newInputs["questionVersionId"] = blockVersion.id;

            case 20:
              if (!(this.answerId === blockVersionData.blockId)) {
                _context5.next = 25;
                break;
              }

              _context5.next = 23;
              return sequelize.models.BlockVersion.create(blockVersionData);

            case 23:
              _blockVersion = _context5.sent;

              newInputs["answerVersionId"] = _blockVersion.id;

            case 25:
              if (!(this.scratchpadId === blockVersionData.blockId)) {
                _context5.next = 30;
                break;
              }

              _context5.next = 28;
              return sequelize.models.BlockVersion.create(blockVersionData);

            case 28:
              _blockVersion2 = _context5.sent;

              newInputs["scratchpadVersionId"] = _blockVersion2.id;

            case 30:
              _iteratorNormalCompletion = true;
              _context5.next = 13;
              break;

            case 33:
              _context5.next = 39;
              break;

            case 35:
              _context5.prev = 35;
              _context5.t0 = _context5['catch'](11);
              _didIteratorError = true;
              _iteratorError = _context5.t0;

            case 39:
              _context5.prev = 39;
              _context5.prev = 40;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 42:
              _context5.prev = 42;

              if (!_didIteratorError) {
                _context5.next = 45;
                break;
              }

              throw _iteratorError;

            case 45:
              return _context5.finish(42);

            case 46:
              return _context5.finish(39);

            case 47:
              _context5.next = 49;
              return this.createWorkspaceVersion(newInputs);

            case 49:
              newWorkspaceVersion = _context5.sent;

            case 50:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this, [[11, 35, 39, 47], [40,, 42, 46]]);
    }));

    return function (_x6) {
      return _ref5.apply(this, arguments);
    };
  }();
  return Workspace;
};