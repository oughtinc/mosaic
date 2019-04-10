"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + "/../../config/config.json")[env];

const AssignmentModel = require("./assignment");
const BlockModel = require("./block");
const ExperimentModel = require("./experiment");
const ExportWorkspaceLockRelationModel = require("./exportWorkspaceLockRelation");
const EventModel = require("./event");
const PointerModel = require("./pointer");
const PointerImportModel = require("./pointerImport");
const TreeModel = require("./tree");
const UserModel = require("./user");
const UserTreeOracleRelationModel = require("./userTreeOracleRelation");
const WorkspaceModel = require("./workspace");

if (config.use_env_variable) {
  const dbURL = process.env[config.use_env_variable];
  console.log("Using DB URL:", dbURL);
  var sequelize = new Sequelize(dbURL, { logging: true, ...config });
} else {
  console.log("No env variable used, using config.");
  var sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    { ...config, logging: true },
  );
}

const models = [
  ["assignment", AssignmentModel],
  ["experiment", ExperimentModel],
  ["exportWorkspaceLockRelation", ExportWorkspaceLockRelationModel],
  ["event", EventModel],
  ["block", BlockModel],
  ["pointer", PointerModel],
  ["pointerImport", PointerImportModel],
  ["tree", TreeModel],
  ["user", UserModel],
  ["userTreeOracleRelation", UserTreeOracleRelationModel],
  ["workspace", WorkspaceModel],
];

const db = {};

models.forEach(m => {
  const model = sequelize.import(m[0], m[1]);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
