'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../../config/config.json')[env];

import BlockModel from './block'
import EventModel from './event'
import PointerModel from './pointer'
import PointerImportModel from './pointerImport'
import WorkspaceModel from './workspace'

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = [
  ['event', EventModel],
  ['block', BlockModel],
  ['pointer', PointerModel],
  ['pointerImport', PointerImportModel],
  ['workspace', WorkspaceModel]
]

const db = {};

models.forEach(m => {
  const model = sequelize.import(m[0], m[1])
  db[model.name] = model
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;