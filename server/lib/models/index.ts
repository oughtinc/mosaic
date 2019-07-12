"use strict";

import { Sequelize } from "sequelize-typescript";
import Assignment from "./assignment";
import Block from "./block";
import Experiment from "./experiment";
import ExportWorkspaceLockRelation from "./exportWorkspaceLockRelation";
import Instructions from "./instructions";
import NotificationRequest from "./notificationRequest";
import Pointer from "./pointer";
import PointerImport from "./pointerImport";
import Snapshot from "./snapshot";
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
    const dbURL = process.env[config.use_env_variable] as string;
    console.log("Using DB URL:", dbURL);
    return new Sequelize(dbURL, { logging: console.log, ...config });
  } else {
    console.log("No env variable used, using config.");
    return new Sequelize({ ...config, logging: true });
  }
}

export async function initializeDb() {
  await sequelize.addModels([
    Assignment,
    Block,
    Experiment,
    ExportWorkspaceLockRelation,
    Instructions,
    NotificationRequest,
    Pointer,
    PointerImport,
    Snapshot,
    Tree,
    User,
    UserTreeOracleRelation,
    Workspace,
  ]);
}

const sequelize = configureDb(config);

export default sequelize;
