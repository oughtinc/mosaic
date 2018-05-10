'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];

const BlockModel = require('./block');
const EventModel = require('./event');
const PointerModel = require('./pointer');
const PointerImportModel = require('./pointerImport');
const WorkspaceModel = require('./workspace');

if (config.use_env_variable) {
  const dbURL = process.env.DATABASE_URL || process.env[config.use_env_variable];
  var sequelize = new Sequelize(dbURL, config);
} else {
  console.log("No env variable used, using config.")
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

module.exports = db;