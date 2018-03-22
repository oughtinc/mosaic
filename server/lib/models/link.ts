'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const LinkModel = (sequelize, DataTypes) => {
  var Link = sequelize.define('Link', {
    id: {
      type: DataTypes.UUID(),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    ...eventRelationshipColumns(DataTypes),
  }, {
      hooks: {
        ...eventHooks.beforeValidate,
    }
  });
  Link.associate = function (models) {
    addEventAssociations(Link, models)
  }

  return Link;
};

export default LinkModel;