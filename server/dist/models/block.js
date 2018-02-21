'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  var Block = sequelize.define('Block', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    }
  }, {
    hooks: {
      // afterCreate: async (block, options) => {
      //   await block.createBlockVersion({value: {}})
      // }
    },
    getterMethods: {
      recentBlockVersion: function recentBlockVersion() {
        var _this = this;

        return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var blockVersions;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return _this.getBlockVersion();

                case 2:
                  blockVersions = _context.sent;
                  return _context.abrupt('return', blockVersions[0]);

                case 4:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this);
        }))();
      },
      workspace: function workspace() {
        var _this2 = this;

        return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var questionWorkspace, answerWorkspace, scratchpadWorkspace;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return _this2.getQuestionWorkspace();

                case 2:
                  questionWorkspace = _context2.sent;
                  _context2.next = 5;
                  return _this2.getAnswerWorkspace();

                case 5:
                  answerWorkspace = _context2.sent;
                  _context2.next = 8;
                  return _this2.getScratchpadWorkspace();

                case 8:
                  scratchpadWorkspace = _context2.sent;
                  return _context2.abrupt('return', questionWorkspace || answerWorkspace || scratchpadWorkspace);

                case 10:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this2);
        }))();
      }
    }
  });
  Block.associate = function (models) {
    Block.BlockVersions = Block.hasMany(models.BlockVersion, { foreignKey: 'blockId' });
    Block.QuestionWorkspace = Block.hasOne(models.Workspace, { foreignKey: 'questionId' });
    Block.AnswerWorkspace = Block.hasOne(models.Workspace, { foreignKey: 'answerId' });
    Block.ScratchpadWorkspace = Block.hasOne(models.Workspace, { foreignKey: 'scratchpadId' });
  };
  return Block;
};