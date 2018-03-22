'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../../config/config.json')[env];

import EventModel from './event'
import WorkspaceModel from './workspace'
import WorkspaceVersionModel from './workspaceVersion'
import NodeModel from './node'
import NodeVersionModel from './nodeVersion'
import LinkModel from './link'
import HypertextModel from './hypertext'

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = [
  ['event', EventModel],
  ['workspace', WorkspaceModel],
  ['workspaceVersion', WorkspaceVersionModel],
  ['node', NodeModel],
  ['nodeVersion', NodeVersionModel],
  ['link', LinkModel],
  ['hypertext', HypertextModel]
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