"use strict";

import { Sequelize } from "sequelize-typescript";
import Assignment from "./assignment";
import Block from "./block";
import Experiment from "./experiment";
import ExperimentTreeRelation from "./experimentTreeRelation";
import ExportWorkspaceLockRelation from "./exportWorkspaceLockRelation";
import Instructions from "./instructions";
import Pointer from "./pointer";
import PointerImport from "./pointerImport";
import Tree from "./tree";
import User from "./user";
import UserTreeOracleRelation from "./userTreeOracleRelation";
import Workspace from "./workspace";
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../../config/config.json")[env];

function configureDb(config: {
  database: string;
  username: string;
  password: string;
  use_env_variable: string;
}) {
  if (config.use_env_variable) {
    const dbURL = process.env[config.use_env_variable] + "?ssl=true";
    console.log("Using DB URL:", dbURL);
    return new Sequelize({ url: dbURL, logging: true, ...config });
  } else {
    console.log("No env variable used, using config.");
    return new Sequelize({ ...config, logging: true });
  }
}

const sequelize = configureDb(config);

sequelize.addModels([
  Assignment,
  Block,
  Experiment,
  ExperimentTreeRelation,
  ExportWorkspaceLockRelation,
  Instructions,
  Pointer,
  PointerImport,
  Tree,
  User,
  UserTreeOracleRelation,
  Workspace
]);

export default sequelize;
