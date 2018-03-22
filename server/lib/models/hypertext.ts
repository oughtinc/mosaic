'use strict';
const Sequelize = require('sequelize')
var _ = require('lodash');
import {eventRelationshipColumns, eventHooks, addEventAssociations} from '../eventIntegration';

const HypertextModel = (sequelize, DataTypes) => {
  var Hypertext = sequelize.define('Hypertext', {
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
  Hypertext.associate = function (models) {
    addEventAssociations(Hypertext, models)
  }

  return Hypertext;
};

export default HypertextModel;